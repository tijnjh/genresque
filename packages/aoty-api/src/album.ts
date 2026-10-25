import { BeautifulSoup, Soup, json } from './compat.js';
import { fetch_html } from './http.js';

export class Album {
    release_date: string;
    constructor(public name: string, public artist: string, date: string) {
        this.release_date = date;
    }
    to_JSON(): string { return json.dumps(this, true, 0); }
}

export class AlbumMethods {
    upcoming_album_class = 'albumBlock five small';
    aoty_albums_per_page = 60;
    page_limit = 21;

    async upcoming_releases_by_limit(total: number): Promise<string> {
        const min_page_number = 1;
        let max_page_number = Math.floor(total / this.aoty_albums_per_page);
        if (total % this.aoty_albums_per_page !== 0) max_page_number += 1;
        const albums: Album[] = [];
        let counter = total;
        for (let page_number = min_page_number; page_number <= max_page_number; page_number++) {
            try {
                if (counter < this.aoty_albums_per_page) {
                    albums.push(...(await this._get_upcoming_releases_by_page(page_number)).slice(0, counter));
                } else {
                    albums.push(...await this._get_upcoming_releases_by_page(page_number));
                    counter -= this.aoty_albums_per_page;
                }
            } catch (e) {
                return json.dumps(this._build_error_response('Page Limit Error',
                    'Number of albums exceeded page limit. Exception raise: .' + (e instanceof Error ? e.message : String(e))));
            }
        }
        const json_albums = albums.map(album => album.to_JSON());
        return json.dumps({ albums: json_albums });
    }

    async upcoming_releases_by_page(page_number: number): Promise<string> {
        let parsed_albums: Album[];
        try { parsed_albums = await this._get_upcoming_releases_by_page(page_number); }
        catch {
            return json.dumps(this._build_error_response('Page Limit Error', 'The page number requested is out of range.'));
        }
        return json.dumps({ albums: parsed_albums.map(album => album.to_JSON()) });
    }

    async upcoming_releases_by_date(month: number, day: number): Promise<string> {
        let parsed_albums: Album[];
        try { parsed_albums = await this._get_upcoming_releases_by_date(month, day); }
        catch (e) {
            return json.dumps(this._build_error_response('Releases by date Error: ', e instanceof Error ? e.message : String(e)));
        }
        return json.dumps({ albums: parsed_albums.map(album => album.to_JSON()) });
    }

    async _get_upcoming_releases_by_date(month: number, day: number): Promise<Album[]> {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const make_date = (year: number): Date => {
            const date = new Date(year, month - 1, day);
            if (!Number.isInteger(month) || !Number.isInteger(day) || date.getMonth() !== month - 1 || date.getDate() !== day) {
                throw new Error('Invalid date');
            }
            return date;
        };
        let target = make_date(today.getFullYear());
        if (target < today) target = make_date(today.getFullYear() + 1);
        const next_day = new Date(target);
        next_day.setDate(next_day.getDate() + 1);
        const target_date = this._map_month_number_to_name(target.getMonth() + 1) + ' ' + target.getDate();
        const next_date = this._map_month_number_to_name(next_day.getMonth() + 1) + ' ' + next_day.getDate();
        let page_number = 1;
        const result_albums: Album[] = [];
        while (page_number <= this.page_limit) {
            let albums: Album[];
            try { albums = await this._get_upcoming_releases_by_page(page_number); }
            catch { break; }
            if (!albums.length) break;
            let reached_next_day = false;
            for (const album of albums) {
                if (album.release_date === target_date) result_albums.push(album);
                if (album.release_date === next_date) reached_next_day = true;
            }
            if (reached_next_day) break;
            page_number += 1;
        }
        return result_albums;
    }

    _build_error_response(error_type: string, msg: string): { error: string; message: string } {
        return { error: error_type, message: msg };
    }

    _map_month_number_to_name(month_number: number): string {
        const month_names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        // Preserve Python's negative indexing for this helper.
        const index = month_number - 1;
        const value = month_names[index < 0 ? month_names.length + index : index];
        if (value === undefined) throw new Error('Invalid month number');
        return value;
    }

    async _get_upcoming_releases_by_page(page_number: number): Promise<Album[]> {
        if (page_number > this.page_limit) throw new Error('Page number out of range');
        const page = page_number === 1 ? '' : String(page_number);
        const url = 'https://www.albumoftheyear.org/upcoming/' + page + '/';
        const release_page = await this._get_release_page_from_request(url);
        const albums = release_page.find_all('div', { class: this.upcoming_album_class });
        return this._parse_albums(albums);
    }

    async _get_release_page_from_request(url: string): Promise<Soup> {
        const unparsed_page = await fetch_html(url);
        return BeautifulSoup(unparsed_page, 'html.parser');
    }

    _parse_albums(unparsed_albums: Soup[]): Album[] {
        const parsed_albums: Album[] = [];
        for (const album of unparsed_albums) {
            const artist = album.find('div', { class: 'artistTitle' })!.getText();
            const title = album.find('div', { class: 'albumTitle' })!.getText();
            const date = album.find('div', { class: 'type' })!.getText();
            parsed_albums.push(new Album(title, artist, date));
        }
        return parsed_albums;
    }
}
