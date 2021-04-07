import { Chapter, ChapterDetails, Tag, HomeSection, LanguageCode, Manga, MangaStatus, MangaTile, SearchRequest, TagSection } from "paperback-extensions-common";
//parseSearch has some issues!

export const parseMangaDetails = ($: CheerioStatic, mangaId: string): Manga => {
  const title = $('h1.heading').first().text().trim();

  const titles = [];
  titles.push(title);
  const altTitles = $('div.alt_name').text().trim().replace(" ", "").split(";");
  altTitles.forEach(t => {
    titles.push(t);
  });

  const image = $('div.media div.cover img').attr('src') ?? "";
  const author = $('.author').text().trim();
  const description = $('.summary > p').text().trim();
  const rawStatus = $('.value.status').text().trim();
  let hentai = false;
  let arrayTags: Tag[] = [];

  $('.genres > a').each((i, tag) => {
    const label = $(tag).text().trim();
    const id = $(tag).attr('href')?.split("genre/")[1] ?? "";
    if (["Adult", "Smut", "Mature"].includes(label)) hentai = true;
    arrayTags.push({ id: id, label: label });
  });
  const tagSections: TagSection[] = [createTagSection({ id: '0', label: 'genres', tags: arrayTags.map(x => createTag(x)) })];

  let status = MangaStatus.ONGOING;
  switch (rawStatus) {
    case 'Ongoing':
      status = MangaStatus.ONGOING;
      break;
    case 'Completed':
      status = MangaStatus.COMPLETED;
      break;
    default:
      status = MangaStatus.ONGOING;
      break;
  }

  return createManga({
    id: mangaId,
    titles: titles,
    image,
    rating: 0,
    status: status,
    author: author,
    artist: "",
    tags: tagSections,
    desc: description,
    hentai: hentai,
  });
}

export const parseChapters = ($: CheerioStatic, mangaId: string): Chapter[] => {
  const chapters: Chapter[] = [];
  const chapterNumberRegex = new RegExp('c([0-9.]+)');

  for (const elem of $('tr:has(.chapter)').toArray()) {
    const title = $("a", elem).text();
    const date = new Date($('.update_time', elem).text() ?? '');
    const chapterId = $('a', elem).attr('href')?.split('/').pop() ?? ''
    const chapterNumber = Number("0" + chapterId.match(chapterNumberRegex)![1]);
    if (isNaN(chapterNumber)) continue;

    chapters.push(createChapter({
      id: chapterId,
      mangaId,
      name: title,
      langCode: LanguageCode.ENGLISH,
      chapNum: chapterNumber,
      time: date,
    }))
  }
  return chapters;
}

export const parseChapterDetails = ($: CheerioStatic, mangaId: string, chapterId: string): ChapterDetails => {
  const pages: string[] = [];

  const imageArrayRegex = RegExp('var ytaw=\\[([^\\[]*)]');
  for (const scriptObj of $('script').toArray()) {
    let script = scriptObj.children[0]?.data;
    if (typeof script === 'undefined') continue
    if (script.includes("var ytaw=")) {
      const array = script.match(imageArrayRegex)![1];
      const img = array.replace(/''?/g, '').split(",");
      for (const i of img) {
        if (i === '') continue;
        pages.push(i);
      }
    }
  }

  let chapterDetails = createChapterDetails({
    id: chapterId,
    mangaId: mangaId,
    pages: pages,
    longStrip: false
  });
  return chapterDetails;
}


export const parseTags = ($: CheerioStatic): TagSection[] | null => {
  const tagSections: TagSection[] = [createTagSection({ id: '0', label: 'genres', tags: [] })];

  for (const p of $(".wrap_item").toArray()) {
    const label = $('a', p).first().text().trim();
    const id = $('a', p).attr("href")?.split("genre/")[1] ?? "";
    tagSections[0].tags.push(createTag({ id: id, label: label }));
  }
  return tagSections;
}

export interface UpdatedManga {
  ids: string[];
  loadMore: boolean;
}

export const parseUpdatedManga = ($: CheerioStatic, time: Date, ids: string[]): UpdatedManga => {
  const updatedManga: string[] = [];
  let loadMore = true;

  for (let manga of $('div.item', 'div#book_list').toArray()) {
    const id = $('a', manga).attr('href')?.split('/').pop() ?? '';
    const mangaDate = new Date($('.update_time', manga).first().text());
    if (mangaDate > time) {
      if (ids.includes(id)) {
        updatedManga.push(id);
      }
    } else {
      loadMore = false;
    }
  }

  return {
    ids: updatedManga,
    loadMore,
  }
}

export const parseHomeSections = ($: CheerioStatic, sections: HomeSection[], sectionCallback: (section: HomeSection) => void): void => {
  for (const section of sections) sectionCallback(section);

  //Hot Mango Update
  const hotMangaUpdate: MangaTile[] = [];
  for (let manga of $('div.item', 'div#hot_update').toArray()) {
    const title: string = $('.title', manga).text().trim();
    const id = $('a', manga).attr('href')?.split('/').pop() ?? '';
    const image = $('img', manga).first().attr('src') ?? "";
    const subtitle: string = $('.chapter', manga).first().text().trim();
    if (!id || !title) continue;
    hotMangaUpdate.push(createMangaTile({
      id: id,
      image: image,
      title: createIconText({ text: title }),
      subtitleText: createIconText({ text: subtitle }),
    }));
  }
  sections[0].items = hotMangaUpdate;
  sectionCallback(sections[0]);

  //Hot Mango
  const hotManga: MangaTile[] = [];
  for (let manga of $('div.item', 'div#hot_book').toArray()) {
    const title: string = $('.title', manga).text().trim();
    const id = $('a', manga).attr('href')?.split('/').pop() ?? '';
    const image = $("img", manga).attr('data-src') ?? "";
    const subtitle: string = $('.chapter', manga).first().text().trim();
    if (!id || !title) continue;
    hotManga.push(createMangaTile({
      id: id,
      image: image,
      title: createIconText({ text: title }),
      subtitleText: createIconText({ text: subtitle }),
    }));
  }
  sections[1].items = hotManga;
  sectionCallback(sections[1]);

  //Latest Mango
  const latestManga: MangaTile[] = [];
  for (let manga of $('div.item', 'div#book_list').toArray()) {
    const title: string = $('.title', manga).text().trim();
    const id = $('a', manga).attr('href')?.split('/').pop() ?? '';
    const image = $('img', manga).first().attr('src') ?? "";
    const subtitle: string = $('.chapter', manga).first().text().trim();
    if (!id || !title) continue;
    latestManga.push(createMangaTile({
      id: id,
      image: image,
      title: createIconText({ text: title }),
      subtitleText: createIconText({ text: subtitle }),
    }));
  }
  sections[2].items = latestManga;
  sectionCallback(sections[2]);

  for (const section of sections) sectionCallback(section);
}

//Fix this later for more stuff if it works, it works.
export const generateSearch = (query: SearchRequest): string => {
  let search: string = query.title?.replace(" ", "+") ?? "";
  return search;
}

/*
ISSUE!
- Exact matches will not show any manga in the search results
- Duplicate and black panels
*/
export const parseSearch = ($: CheerioStatic): MangaTile[] => {
  const mangas: MangaTile[] = [];
  try {

    if ($('meta[property="$=url"]').attr('content')?.includes("/manga/")) {
      const title = $('h1.heading').first().text().trim() ?? "";
      const id = $('meta[property$=url]"]').attr('content')?.split('/')?.pop() ?? "";
      const image = $('div.media div.cover img').attr('src') ?? "";
      if (id && title) {
        mangas.push(createMangaTile({
          id,
          image: image,
          title: createIconText({ text: title }),
        }));
      }
    } else {

      const collectedIds: string[] = [];
      for (const manga of $("div.item", "#book_list").toArray()) {
        const title: string = $('.title a', manga).text().trim();
        const id = $('a', manga).attr('href')?.split('/').pop() ?? '';
        const image = $("img", manga).attr('src') ?? "";
        const subtitle: string = $('.chapter', manga).first().text().trim();
        if (!collectedIds.includes(id) && id && title) {
          mangas.push(createMangaTile({
            id,
            image: image,
            title: createIconText({ text: title }),
            subtitleText: createIconText({ text: subtitle }),
          }));
          collectedIds.push(id);
        };
      }
    }
  } catch (e) {
    console.log(e);
  }
  return mangas;
}


export const parseViewMore = ($: CheerioStatic, homepageSectionId: string): MangaTile[] => {
  const manga: MangaTile[] = [];
  for (let p of $('div.item', 'div#book_list').toArray()) {
    const title: string = $('.title a', p).text().trim();
    const id = $('a', p).attr('href')?.split('/').pop() ?? '';
    const image = $("img", p).attr('src') ?? "";
    const subtitle: string = $('.chapter', p).first().text().trim();
    if (!id || !title) continue;
    manga.push(createMangaTile({
      id,
      image,
      title: createIconText({ text: title }),
      subtitleText: createIconText({ text: subtitle }),
    }));
  }
  return manga;
}

export const isLastPage = ($: CheerioStatic): boolean => {
  let isLast = true;

  let hasNext = Boolean($("a.next.page-numbers", 'ul.uk-pagination').text());
  if (hasNext) isLast = false;
  /*
    let current = Number($("span.page-numbers.current", 'ul.uk-pagination').text());
    let totalPages = [];
  
    for (const p of $("a.page-numbers", 'ul.uk-pagination').toArray()) {
      let page = Number($(p).text().trim());
      if (isNaN(page)) continue;
      totalPages.push(page);
    }
    let lastPage = Math.max(...totalPages);
    if (lastPage >= current) isLast = false;
    */
  return isLast;
}