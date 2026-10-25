import { BeautifulSoup, Soup, int, json } from "./compat.js";
import { fetch_html } from "./http.js";

export interface RankedAlbum { rank: string | null; name: string | null; date: string | null; score: number | null; review_count: number | null; }

export const GENRE_MAP: Record<string, string> = { "indie rock": "1-indie-rock", electronic: "6-electronic", rock: "7-rock", pop: "15-pop", metal: "40-metal" };

export class GenreMethods {
    genre_page_url = "";
    genre_page: Soup | null = null;
    genre_base_url = "https://www.albumoftheyear.org/genre/";

    private __resolve_genre(genre: string): string {
        return GENRE_MAP[genre.toLowerCase()] ?? genre;
    }

    private __build_url(genre: string, year: number | string | null = null): string {
        if (year === null) year = new Date().getFullYear();
        return `${this.genre_base_url}${genre}/${year}/`;
    }

    private async __set_genre_page(url: string): Promise<void> {
        this.genre_page_url = url;
        const ugly_page = await fetch_html(url);
        this.genre_page = BeautifulSoup(ugly_page, 'html.parser');
    }

    private async __ensure_genre_page(url: string): Promise<void> {
        if (this.genre_page_url !== url || this.genre_page === null) await this.__set_genre_page(url);
    }

    private __parse_genre_albums(): RankedAlbum[] {
        const albums: RankedAlbum[] = [];
        for (const row of this.genre_page!.find_all('div', { class: 'albumListRow' })) {
            const rank_span = row.find('span', { itemprop: 'position' });
            const rank = rank_span ? rank_span.getText().trim() : null;
            const name_meta = row.find('meta', { itemprop: 'name' });
            const name = name_meta ? name_meta.attr('content') : null;
            const date_div = row.find('div', { class: 'albumListDate' });
            const date = date_div ? date_div.getText().trim() : null;
            const score_div = row.find('div', { class: 'scoreValue' });
            const score = score_div ? int(score_div.getText().trim()) : null;
            const score_text_div = row.find('div', { class: 'scoreText' });
            const review_count = score_text_div ? int(score_text_div.getText().trim().split(/\s+/)[0]) : null;
            albums.push({ rank, name, date, score, review_count });
        }
        return albums;
    }

    async genre_albums(genre: string, year: number | string | null = null): Promise<RankedAlbum[]> {
        const slug = this.__resolve_genre(genre);
        const url = this.__build_url(slug, year);
        await this.__ensure_genre_page(url);
        return this.__parse_genre_albums();
    }

    async genre_albums_json(genre: string, year: number | string | null = null): Promise<string> {
        return json.dumps({ albums: await this.genre_albums(genre, year) });
    }
}
