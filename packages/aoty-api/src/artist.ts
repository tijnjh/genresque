import { BeautifulSoup, Soup, int, json } from './compat.js';
import { fetch_html } from './http.js';

export class ArtistMethods {
    artist = '';
    url = '';
    artist_url = 'https://www.albumoftheyear.org/artist/';
    artist_page!: Soup;
    albums: string[] = [];
    mixtapes: string[] = [];
    eps: string[] = [];
    live_albums: string[] = [];
    compilations: string[] = [];
    singles: string[] = [];
    appears_on: string[] = [];
    similar_artists_cat: string[] = [];
    top_songs: string[] = [];

    private async __set_artist_page(artist: string, url: string): Promise<void> {
        this.artist = artist;
        this.url = url;
        const ugly_artist_page = await fetch_html(this.url);
        this.artist_page = BeautifulSoup(ugly_artist_page, 'html.parser');
        await this.__get_discography(artist);
        await this.__get_community_data(artist);
    }

    private async __class_text(artist: string, class_name: string, url: string): Promise<string> {
        if (this.url !== url) await this.__set_artist_page(artist, url);
        return this.artist_page.find(null, { class: class_name })!.getText();
    }

    private async __get_discography(artist: string): Promise<void> {
        const url = this.artist_url + artist + '/';
        if (this.url !== url) await this.__set_artist_page(artist, url);
        const categorized_albums: Record<string, string[]> = Object.create(null);
        const elements = this.artist_page.find_all(['h2', 'div']);
        let current_category: string | null = null;
        for (const element of elements) {
            if (element.name === 'h2') {
                current_category = element.get_text('', true);
                categorized_albums[current_category] = [];
            } else if (element.name === 'div' && current_category === 'Similar Artists') {
                const album_title_div = element.find('div', { class: 'name' });
                if (album_title_div) {
                    const album_name = album_title_div.get_text().trim();
                    categorized_albums[current_category].push(album_name);
                }
            } else if (element.name === 'div' && current_category) {
                const album_title_div = element.find('div', { class: 'albumTitle' });
                if (album_title_div) {
                    const album_name = album_title_div.get_text().trim();
                    categorized_albums[current_category].push(album_name);
                }
            }
        }
        this.albums = categorized_albums['Albums'] ?? [];
        this.mixtapes = categorized_albums['Mixtapes'] ?? [];
        this.eps = categorized_albums['EPs'] ?? [];
        this.live_albums = categorized_albums['Live Albums'] ?? [];
        this.compilations = categorized_albums['Compilations'] ?? [];
        this.singles = categorized_albums['SinglesView All'] ?? [];
        this.appears_on = categorized_albums['Appears OnView All'] ?? [];
        this.similar_artists_cat = categorized_albums['Similar Artists'] ?? [];
    }

    private async __get_community_data(artist: string): Promise<void> {
        const url = this.artist_url + artist + '/';
        if (this.url !== url) await this.__set_artist_page(artist, url);
        const rows = this.artist_page.find_all('tr');
        const extracted_texts: string[] = [];
        for (const row of rows) {
            const song_album_div = row.find('td', { class: 'songAlbum' });
            if (song_album_div) {
                const link = song_album_div.find('a');
                if (link) extracted_texts.push(link.get_text().trim());
            }
        }
        this.top_songs = extracted_texts;
    }

    async artist_albums(artist: string): Promise<string[]> {
        const url = this.artist_url + artist + "/";
        if (this.url !== url) await this.__set_artist_page(artist, url);
        return this.albums;
    }

    async artist_albums_json(artist: string): Promise<string> {
        return json.dumps({ 'albums': await this.artist_albums(artist) });
    }

    async artist_mixtapes(artist: string): Promise<string[]> {
        const url = this.artist_url + artist + "/";
        if (this.url !== url) await this.__set_artist_page(artist, url);
        return this.mixtapes;
    }

    async artist_mixtapes_json(artist: string): Promise<string> {
        return json.dumps({ 'mixtapes': await this.artist_mixtapes(artist) });
    }

    async artist_eps(artist: string): Promise<string[]> {
        const url = this.artist_url + artist + "/";
        if (this.url !== url) await this.__set_artist_page(artist, url);
        return this.eps;
    }

    async artist_eps_json(artist: string): Promise<string> {
        return json.dumps({ 'eps': await this.artist_eps(artist) });
    }

    async artist_live_albums(artist: string, as_json?: false): Promise<string[]>;
    async artist_live_albums(artist: string, as_json: true): Promise<string>;
    async artist_live_albums(artist: string, as_json: boolean): Promise<string[] | string>;

    async artist_live_albums(artist: string, as_json = false): Promise<string[] | string> {
        const url = this.artist_url + artist + "/";
        if (this.url !== url) await this.__set_artist_page(artist, url);
        if (as_json) return json.dumps({ 'live albums': this.live_albums });
        return this.live_albums;
    }

    async artist_compilations(artist: string, as_json?: false): Promise<string[]>;
    async artist_compilations(artist: string, as_json: true): Promise<string>;
    async artist_compilations(artist: string, as_json: boolean): Promise<string[] | string>;

    async artist_compilations(artist: string, as_json = false): Promise<string[] | string> {
        const url = this.artist_url + artist + "/";
        if (this.url !== url) await this.__set_artist_page(artist, url);
        if (as_json) return json.dumps({ 'compilations': this.compilations });
        return this.compilations;
    }

    async artist_appears_on(artist: string, as_json?: false): Promise<string[]>;
    async artist_appears_on(artist: string, as_json: true): Promise<string>;
    async artist_appears_on(artist: string, as_json: boolean): Promise<string[] | string>;

    async artist_appears_on(artist: string, as_json = false): Promise<string[] | string> {
        const url = this.artist_url + artist + "/";
        if (this.url !== url) await this.__set_artist_page(artist, url);
        if (as_json) return json.dumps({ 'appears on': this.appears_on });
        return this.appears_on;
    }

    async artist_singles(artist: string): Promise<string[]> {
        const url = this.artist_url + artist + "/";
        if (this.url !== url) await this.__set_artist_page(artist, url);
        return this.singles;
    }

    async artist_singles_json(artist: string): Promise<string> {
        return json.dumps({ 'singles': await this.artist_singles(artist) });
    }

    async artist_top_songs(artist: string): Promise<string[]> {
        const url = this.artist_url + artist + "/";
        if (this.url !== url) await this.__set_artist_page(artist, url);
        return this.top_songs;
    }

    async artist_top_songs_json(artist: string): Promise<string> {
        return json.dumps({ 'top songs': await this.artist_top_songs(artist) });
    }

    async similar_artists(artist: string): Promise<string[]> {
        const url = this.artist_url + artist + "/";
        if (this.url !== url) await this.__set_artist_page(artist, url);
        return this.similar_artists_cat;
    }

    async similar_artists_json(artist: string): Promise<string> {
        return json.dumps({ 'similar artists': await this.similar_artists(artist) });
    }

    async artist_name(artist: string): Promise<string> {
        return this.__class_text(artist, 'artistHeadline', this.artist_url + artist + "/");
    }

    async artist_name_json(artist: string): Promise<string> {
        return json.dumps({ 'name': await this.artist_name(artist) });
    }

    async artist_critic_score(artist: string): Promise<string> {
        return this.__class_text(artist, 'artistCriticScore', this.artist_url + artist + "/");
    }

    async artist_critic_score_json(artist: string): Promise<string> {
        return json.dumps({ 'critic score': await this.artist_critic_score(artist) });
    }

    async artist_user_score(artist: string): Promise<string> {
        return this.__class_text(artist, 'artistUserScore', this.artist_url + artist + "/");
    }

    async artist_user_score_json(artist: string): Promise<string> {
        return json.dumps({ 'user score': await this.artist_user_score(artist) });
    }

    async artist_follower_count(artist: string): Promise<string> {
        return this.__class_text(artist, 'followCount', this.artist_url + artist + "/");
    }

    async artist_follower_count_json(artist: string): Promise<string> {
        return json.dumps({ 'follower count': await this.artist_follower_count(artist) });
    }

    async artist_details(artist: string): Promise<string> {
        return this.__class_text(artist, 'artistTopBox info', this.artist_url + artist + "/");
    }

    async artist_details_json(artist: string): Promise<string> {
        return json.dumps({ 'artist details': await this.artist_details(artist) });
    }

    async artist_total_score(artist: string): Promise<number> {
        return (int(await this.artist_critic_score(artist)) + int(await this.artist_user_score(artist))) / 2;
    }

    async artist_total_score_json(artist: string): Promise<string> {
        const score = await this.artist_total_score(artist);
        // Python division produces a float, including the .0 for whole scores.
        return '{"total score": ' + (Number.isInteger(score) ? score.toFixed(1) : String(score)) + '}';
    }
}
