import {Chapter, LanguageCode, Manga, MangaStatus, MangaTile, Tag} from "paperback-extensions-common";

export class CatMangaParser {

    decodeHTMLEntity(str: string): string {
        return str.replace(/&#(\d+);/g, function (match, dec) {
            return String.fromCharCode(dec);
        })
    }

    parseTileList($: CheerioStatic, className: string, className2: string | null = null) {
        if (className2 === null){
            className2 = className;
        }
        const mangaTiles: MangaTile[] = [];
        $(`div[class^=${className}_grid] *[class^=${className2}_element]`).map((index, element) => {
            const linkId = element.attribs["href"];
            if (linkId) {
                const tile: MangaTile = {
                    id: linkId.replace(`/series/`, "").split("/")[0],
                    title: createIconText({
                        text: this.decodeHTMLEntity($("p", element).first().text().trim())
                    }),
                    image: $("img", element).attr("src") || ""
                }
                if ($("p", element).length > 1){
                    tile.primaryText = createIconText({
                        text: this.decodeHTMLEntity($("p", element).last().text().trim())
                    });
                }
                mangaTiles.push(createMangaTile(tile));
            }
        })
        return mangaTiles;
    }

    parseFeatured($: CheerioStatic, base: string){
        const seen: string[] = [];
        const mangaTiles: MangaTile[] = [];
        $("ul.slider li.slide").map((index, element) => {
            const link = $("a", element);
            const linkId = link.attr("href")
            if (linkId){
                const id = linkId.replace(`/series/`, "").split("/")[0];
                if (!seen.includes(id)){
                    seen.push(id);
                    mangaTiles.push(createMangaTile({
                        id: id,
                        title: createIconText({
                            text: this.decodeHTMLEntity($("h1", element).first().text().trim())
                        }),
                        image: base + $("img", element).attr("src") || "",
                        primaryText: createIconText({
                            text: this.decodeHTMLEntity($("div p", $("a", element).parent()).first().text().trim())
                        })
                    }))
                }
            }
        })
        return mangaTiles;
    }

    parsePages($: CheerioStatic): string[] {
        const json = JSON.parse($("script#__NEXT_DATA__").html() || "{}");
        if (json){
            const props = json.props;
            if (props){
                const pageProps = props.pageProps;
                if (pageProps){
                    const pages = pageProps.pages;
                    if (pages){
                        return pages;
                    }
                }
            }
        }
        return [];
    }

    parseChapterList($: CheerioStatic, mangaId: string){
        const chapters = []
        const json = JSON.parse($("script#__NEXT_DATA__").html() || "{}");
        if (json){
            const props = json.props;
            if (props){
                const pageProps = props.pageProps;
                if (pageProps){
                    const series = pageProps.series;
                    if (series && series.chapters && (series.chapters.length || 0) > 0){
                        for (let i = 0; i < series.chapters.length; i++) {
                            const chapter = series.chapters[i];
                            if (chapter.number){
                            chapters.push(createChapter({
                                chapNum: chapter.number,
                                id: String(chapter.number),
                                langCode: LanguageCode.ENGLISH,
                                mangaId: mangaId,
                                name: this.decodeHTMLEntity(chapter.title || "") || undefined,
                                group: (chapter.groups || []).join(", ")
                            }))}
                        }
                        if (chapters.length > 0){
                        return chapters;
                        }
                    }
                }
            }
        }
        return this.parseChapterListFallback($, mangaId);
    }

    parseChapterListFallback($: CheerioStatic, mangaId: string) {
        const chapters: Chapter[] = [];
        $('a[class^="chaptertile_element"]').map((index, element) => {
            const chapNumString = $("p", element).first().text().replace("Chapter ", "")
            const chapNum = Number(chapNumString) || 0;
            let title: string | null = null;
            if (chapNum === 0){
                title = chapNumString;
            }
            const data: Chapter = {
                chapNum: chapNum,
                id: String(chapNum),
                langCode: LanguageCode.ENGLISH,
                mangaId: mangaId,
                name: this.decodeHTMLEntity(title || $("p", element).last().text().trim())
            };
            chapters.push(createChapter(data));
        })
        return chapters
    }

    parseManga($: CheerioStatic, mangaId: string){
        const json = JSON.parse($("script#__NEXT_DATA__").html() || "{}");
        if (json){
            const props = json.props;
            if (props){
                const pageProps = props.pageProps;
                if (pageProps){
                    const series = pageProps.series;
                    if (series && series.genres && (series.genres.length || 0) > 0 && series.title && series.decription && series.status && series.cover_art && series.conver_art.source){
                        let titles = [series.title]
                        const covers = [];
                        const tags = []
                        if (series.alt_titles){
                            titles = titles.concat(series.alt_titles)
                        }
                        if (series.all_covers){
                            for (let i = 0; i < series.all_covers.length; i++) {
                                const cover = series.all_covers[i];
                                covers.push(`https://images.catmanga.org${cover.source || ""}`)
                            }
                        }
                        let status;
                        if ((series.status || "").toLowerCase().includes("ongoing")){
                            status = MangaStatus.ONGOING;
                        } else {
                            status = MangaStatus.COMPLETED;
                        }
                        for (let i = 0; i < series.genres.length; i++) {
                            const tag = series.genres[i];
                            tags.push(createTag({
                                id: tag,
                                label: tag
                            }))
                        }
                        for (let i = 0; i < series.authors.length; i++) {
                            series.authors[i] = this.decodeHTMLEntity(series.authors[i]);
                        }
                        for (let i = 0; i < titles.length; i++) {
                            titles[i] = this.decodeHTMLEntity(titles[i]);
                        }
                        return createManga({
                            author: (series.authors || []).join(", "),
                            covers: covers,
                            desc: this.decodeHTMLEntity(series.description),
                            id: mangaId,
                            image: series.cover_art.source,
                            rating: 0,
                            status: status,
                            tags: [createTagSection({
                                id: "genres",
                                label: "Genres",
                                tags: tags
                            })],
                            titles: titles
                        })
                    }
                }
            }
        }
        return this.parseMangaFallback($, mangaId);
    }

    parseMangaFallback($: CheerioStatic, mangaId: string) {
        const tags: Tag[] = [];
        $('div[class^="series_tags"] p').map((index, element) => {
            const text = $(element).text().trim();
            tags.push(createTag({
                id: text,
                label: text
            }));
        });
        let status;
        if ($('p[class^="series_seriesStatus"]').first().text().trim().toLowerCase().includes("ongoing")){
            status = MangaStatus.ONGOING;
        } else {
            status = MangaStatus.COMPLETED;
        }
        const mangaObj: Manga = {
            desc: this.decodeHTMLEntity($('div[class^="series_seriesDesc"]').first().text().trim()),
            id: mangaId,
            image: $("img").attr("src") || "",
            rating: 0,
            status: status,
            titles: [this.decodeHTMLEntity($("h1").first().text())],
            tags: [createTagSection({
                id: "tags",
                label: "Tags",
                tags: tags
            })]
        }
        return createManga(mangaObj)
    }

}