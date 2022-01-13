import RemoteStorage from "remotestoragejs";

const RS_PATH = "cubari";

export const remoteStorage = (() => {
  // Define the schema for our history
  const Model = {
    name: RS_PATH,
    builder: (privateClient) => {
      const SERIES_META = "series";
      const REPLACEMENT_STR = "{SOURCE_SLUG_REPLACEMENT}";
      const SERIES_META_PATH_BASE = "series/";
      const SERIES_META_PATH = `${SERIES_META_PATH_BASE}${REPLACEMENT_STR}`;

      privateClient.declareType(SERIES_META, {
        type: "object",
        properties: {
          slug: {
            type: "string",
          },
          coverUrl: {
            type: "string",
          },
          source: {
            type: "string",
          },
          url: {
            type: "string",
          },
          title: {
            type: "string",
          },
          timestamp: {
            type: "number",
          },
          chapters: {
            type: "array",
            default: [], // Note that these aren't validated by our schema handler
          },
          pinned: {
            type: "boolean",
            default: false, // Thus it's documenting only; handle it
          },
        },
        required: [
          "slug",
          "source",
          "url",
          "title",
          "timestamp",
          "chapters",
          "pinned",
        ],
      });

      let slugBuilder = (slug, source) => {
        return `${source}-${slug}`;
      };

      let pathBuilder = (path, slug, source) => {
        return path.replace(REPLACEMENT_STR, slugBuilder(slug, source));
      };

      let seriesBuilder = (
        slug,
        coverUrl,
        source,
        url,
        title,
        pinned,
        chapters
      ) => {
        return {
          slug: slug,
          coverUrl: coverUrl || "",
          source: source,
          url: url,
          title: title,
          timestamp: Date.now(),
          chapters: chapters || [],
          pinned: pinned === undefined ? false : pinned,
        };
      };

      return {
        exports: {
          slugBuilder,
          addSeries: (slug, coverUrl, source, url, title, pinned, chapters) => {
            let toStore = seriesBuilder(
              slug,
              coverUrl,
              source,
              url,
              title,
              pinned,
              chapters
            );
            return privateClient.storeObject(
              SERIES_META,
              pathBuilder(SERIES_META_PATH, slug, source),
              toStore
            );
          },
          editSeries: async (
            slug,
            coverUrl,
            source,
            url,
            title,
            pinned,
            chapters
          ) => {
            let obj = await privateClient.getObject(
              pathBuilder(SERIES_META_PATH, slug, source)
            );
            if (obj) {
              let toStore = seriesBuilder(
                slug || obj.slug,
                coverUrl || obj.coverUrl,
                source || obj.source,
                url || obj.url,
                title || obj.title,
                pinned !== undefined ? pinned : obj.pinned,
                chapters || obj.chapters // Empty array is truthy
              );
              return privateClient.storeObject(
                SERIES_META,
                pathBuilder(SERIES_META_PATH, slug, source),
                toStore
              );
            } else {
              console.error(
                "[Remote Storage] Cannot edit a non-existent series."
              );
            }
          },
          getSeries: (slug, source) => {
            return privateClient.getObject(
              pathBuilder(SERIES_META_PATH, slug, source),
              false // Disable maxAge in order to prevent negative caching
            );
          },
          removeSeries: (slug, source) => {
            return privateClient.remove(
              pathBuilder(SERIES_META_PATH, slug, source)
            );
          },
          getAllSeries: () => {
            // Note for the future: getAll gives you the objects within, while
            // getListing gives you just a list of files; thus, this gives you the
            // metadata within
            if (privateClient.storage.connected) {
              // maxAge cache in millis
              return privateClient.getAll(SERIES_META_PATH_BASE, 60000);
            } else {
              // Promise resolves immediately if no storage is connected
              // https://remotestoragejs.readthedocs.io/en/v1.2.3/js-api/base-client.html#caching-logic-for-read-operations
              return privateClient.getAll(SERIES_META_PATH_BASE);
            }
          },
        },
      };
    },
  };

  let remoteStorage = new RemoteStorage({
    cache: true,
    modules: [Model],
    // This is LITERALLY not documented, but I've dug into the code to find
    // this behaviour; IndexedDB can fail to open if the previous commit failed,
    // which causes startup times of the app to skyrocket. We'll disable it
    // completely.
    // https://github.com/remotestorage/remotestorage.js/blob/0e6ef757e6fd2d5c067207cb07b7d62e820a58ec/src/features.ts#L57-L65
    disableFeatures: ["Dropbox", "GoogleDrive", "IndexedDB"],
  });

  remoteStorage.access.claim(RS_PATH, "rw");
  remoteStorage.caching.enable(`/${RS_PATH}/`);

  return remoteStorage;
})();

// This will be the main handler that deals with both
// chapter and series history. All logic should be here
// and abstracted from the rest of the code
export const globalHistoryHandler = (() => {
  const SORT_KEY = "timestamp";
  const MAX_VALUES = 20;

  // Helper to return an array of objects from a nested object, sorted by key
  let sortObjectByKey = (obj, key) => {
    let sortable = [];
    for (let k in obj) {
      sortable.push(obj[k]);
    }
    sortable.sort((f, s) => s[key] - f[key]);
    return sortable;
  };

  const sync = async () => {
    // Sync operation ensures the local cache doesn't have any dangling objects.
    // We'll sort for the timestamp key since that's what we use everywhere else
    let allSeries = await remoteStorage[RS_PATH].getAllSeries();
    for (const [key, value] of Object.entries(allSeries)) {
      try {
        if (!value[SORT_KEY]) {
          // We don't use split here since the slug can potentially include "-"
          let separatorIndex = key.indexOf("-");
          let slug = key.slice(separatorIndex + 1);
          let source = key.slice(0, separatorIndex);
          await remoteStorage[RS_PATH].removeSeries(slug, source);
        }
      } catch (e) {
        console.error("[Global History] Sync error, continuing.");
      }
    }
  };

  const pushSeries = async (slug, coverUrl, source, url, title) => {
    await sync();
    let allCurrentSeries = sortObjectByKey(
      (await remoteStorage[RS_PATH].getAllSeries()) || {},
      SORT_KEY
    );
    let existingSeries = allCurrentSeries.find(
      (e) => e.slug === slug && e.source === source
    );

    allCurrentSeries = allCurrentSeries.filter((e) => !e.pinned);

    // Be mindful of the cap regardless of the state of the tree
    while (allCurrentSeries.length + (existingSeries ? 0 : 1) > MAX_VALUES) {
      let last = allCurrentSeries.pop();
      await remoteStorage[RS_PATH].removeSeries(last.slug, last.source);
    }

    if (existingSeries) {
      // Effectively this updates the timestamp of the series, pushing it to the top
      return remoteStorage[RS_PATH].editSeries(
        slug,
        coverUrl,
        source,
        url,
        title,
        existingSeries.pinned,
        existingSeries.chapters
      );
    } else {
      return remoteStorage[RS_PATH].addSeries(
        slug,
        coverUrl,
        source,
        url,
        title,
        undefined,
        undefined
      );
    }
  };

  const removeSeries = async (slug, source) => {
    await sync();
    return remoteStorage[RS_PATH].removeSeries(slug, source);
  };

  const removeAllUnpinnedSeries = async () => {
    let series = await globalHistoryHandler.getAllUnpinnedSeries();
    if (series) {
      Array.prototype.forEach.call(series, (srs) => {
        removeSeries(srs.slug, srs.source);
      });
    }
  };

  const addChapters = async (slug, source, chapters) => {
    let existingSeries = await remoteStorage[RS_PATH].getSeries(slug, source);

    if (existingSeries) {
      chapters = [...new Set([...chapters, ...existingSeries.chapters])];
      return remoteStorage[RS_PATH].editSeries(
        slug,
        undefined,
        source,
        undefined,
        undefined,
        undefined,
        chapters
      );
    } else {
      console.error("[Global History] addChapters - Series didn't exist.");
    }
  };

  const addChapter = async (slug, source, chapter) => {
    return addChapters(slug, source, [chapter]);
  };

  const removeChapter = async (slug, source, chapter) => {
    let existingSeries = await remoteStorage[RS_PATH].getSeries(slug, source);

    if (existingSeries) {
      let chapters = existingSeries.chapters.filter((e) => e !== chapter);
      return remoteStorage[RS_PATH].editSeries(
        slug,
        undefined,
        source,
        undefined,
        undefined,
        undefined,
        chapters
      );
    } else {
      console.error("[Global History] removeChapter - Series didn't exist.");
    }
  };

  const removeAllChapters = async (slug, source) => {
    let existingSeries = await remoteStorage[RS_PATH].getSeries(slug, source);

    if (existingSeries) {
      return remoteStorage[RS_PATH].editSeries(
        slug,
        undefined,
        source,
        undefined,
        undefined,
        undefined,
        []
      );
    } else {
      console.error(
        "[Global History] removeAllChapters - series didn't exist."
      );
    }
  };

  const getReadChapters = async (slug, source) => {
    let existingSeries = await remoteStorage[RS_PATH].getSeries(slug, source);

    if (existingSeries) {
      return existingSeries.chapters;
    } else {
      console.error("[Global History] getReadChapters - series didn't exist.");
    }
  };

  const isSeriesPinned = async (slug, source) => {
    let existingSeries = await remoteStorage[RS_PATH].getSeries(slug, source);
    return existingSeries && existingSeries.pinned ? true : false; // Always return a boolean
  };

  const pinSeries = async (slug, coverUrl, source, url, title) => {
    let existingSeries = await remoteStorage[RS_PATH].getSeries(slug, source);

    if (existingSeries) {
      return remoteStorage[RS_PATH].editSeries(
        slug,
        undefined,
        source,
        undefined,
        undefined,
        true,
        undefined
      );
    } else {
      return remoteStorage[RS_PATH].addSeries(
        slug,
        coverUrl,
        source,
        url,
        title,
        true,
        undefined
      );
    }
  };

  const unpinSeries = async (slug, source) => {
    let existingSeries = await remoteStorage[RS_PATH].getSeries(slug, source);

    if (existingSeries) {
      return remoteStorage[RS_PATH].editSeries(
        slug,
        undefined,
        source,
        undefined,
        undefined,
        false,
        undefined
      );
    } else {
      console.error("[Global History] unpinSeries - series didn't exist.");
    }
  };

  const getAllPinnedSeries = async () => {
    await sync();
    return sortObjectByKey(
      (await remoteStorage[RS_PATH].getAllSeries()) || {},
      SORT_KEY
    ).filter((e) => e.pinned);
  };

  const getAllUnpinnedSeries = async () => {
    await sync();
    return sortObjectByKey(
      (await remoteStorage[RS_PATH].getAllSeries()) || {},
      SORT_KEY
    ).filter((e) => !e.pinned);
  };

  return {
    max: MAX_VALUES,
    pushSeries,
    removeSeries,
    removeAllUnpinnedSeries,
    addChapters,
    addChapter,
    removeChapter,
    removeAllChapters,
    getReadChapters,
    isSeriesPinned,
    pinSeries,
    unpinSeries,
    getAllPinnedSeries,
    getAllUnpinnedSeries,
  };
})();

export const purgePreviousCache = () => {
  // Remove the nodes from the internal tree structure
  remoteStorage.caching.reset();
  // Clean up orphaned cache entries from the last time the app was loaded
  for (let [key, value] of Object.entries(localStorage)) {
    if (key.startsWith("remotestorage") && value === "undefined") {
      localStorage.removeItem(key);
    }
  }
};
