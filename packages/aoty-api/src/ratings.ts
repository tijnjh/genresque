import { BeautifulSoup, Soup, int, json } from "./compat.js";
import { fetch_html } from "./http.js";

export interface RankedAlbum { rank: string | null; name: string | null; date: string | null; score: number | null; review_count: number | null; }

export class RatingsMethods {
    _ratings_page_url = "";
    _ratings_page: Soup | null = null;

    private async __set_ratings_page(url: string): Promise<void> {
        this._ratings_page_url = url;
        const ugly_page = await fetch_html(url);
        this._ratings_page = BeautifulSoup(ugly_page, 'html.parser');
    }

    private async __ensure_ratings_page(url: string): Promise<void> {
        if (this._ratings_page_url !== url || this._ratings_page === null) await this.__set_ratings_page(url);
    }

    private __parse_ratings_albums(): RankedAlbum[] {
        const albums: RankedAlbum[] = [];
        for (const row of this._ratings_page!.find_all('div', { class: 'albumListRow' })) {
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

    async top_albums_by_year(year: number | string | null = null): Promise<RankedAlbum[]> {
        if (year === null) year = new Date().getFullYear();
        const url = `https://www.albumoftheyear.org/ratings/6-highest-rated/${year}/1`;
        await this.__ensure_ratings_page(url);
        return this.__parse_ratings_albums();
    }

    async top_albums_by_year_json(year: number | string | null = null): Promise<string> {
        return json.dumps({ albums: await this.top_albums_by_year(year) });
    }
}
