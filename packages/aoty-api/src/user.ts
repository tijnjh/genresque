import { BeautifulSoup, Soup, int, json } from './compat.js';
import { fetch_html } from './http.js';

export interface UserAlbum { artist: string; album: string; }
export interface UserRating extends UserAlbum { rating: string; }
export interface UserReview extends UserRating { review: string; }

export class UserMethods {
    user = '';
    url = '';
    user_url = 'https://www.albumoftheyear.org/user/';
    user_page!: Soup;

    private async __set_user_page(user: string, url: string): Promise<void> {
        this.user = user;
        this.url = url;
        const ugly_user_page = await fetch_html(this.url);
        this.user_page = BeautifulSoup(ugly_user_page, 'html.parser');
    }

    async user_rating_count(user: string): Promise<number> {
        const url = this.user_url + user;
        if (this.url !== url) await this.__set_user_page(user, url);
        const ratings_section = this.user_page.find(null, { href: `/user/${this.user}/ratings/` });
        const ratings_text = ratings_section!.find(null, { class: 'profileStat' })!.getText();
        try { return int(ratings_text.replaceAll(',', '').trim()); }
        catch { return 0; }
    }

    async user_rating_count_json(user: string): Promise<string> {
        return json.dumps({ ratings: await this.user_rating_count(user) });
    }

    async user_review_count(user: string): Promise<number> {
        const url = this.user_url + user;
        if (this.url !== url) await this.__set_user_page(user, url);
        const reviews_section = this.user_page.find(null, { href: `/user/${this.user}/reviews/` });
        const reviews_text = reviews_section!.find(null, { class: 'profileStat' })!.getText();
        try { return int(reviews_text.replaceAll(',', '').trim()); }
        catch { return 0; }
    }

    async user_review_count_json(user: string): Promise<string> {
        return json.dumps({ reviews: await this.user_review_count(user) });
    }

    async user_list_count(user: string): Promise<number> {
        const url = this.user_url + user;
        if (this.url !== url) await this.__set_user_page(user, url);
        const lists_section = this.user_page.find(null, { href: `/user/${this.user}/lists/` });
        const lists_text = lists_section!.find(null, { class: 'profileStat' })!.getText();
        try { return int(lists_text.replaceAll(',', '').trim()); }
        catch { return 0; }
    }

    async user_list_count_json(user: string): Promise<string> {
        return json.dumps({ lists: await this.user_list_count(user) });
    }

    async user_follower_count(user: string): Promise<number> {
        const url = this.user_url + user;
        if (this.url !== url) await this.__set_user_page(user, url);
        const followers_section = this.user_page.find(null, { href: `/user/${this.user}/followers/` });
        const followers_text = followers_section!.find(null, { class: 'profileStat' })!.getText();
        try { return int(followers_text.replaceAll(',', '').trim()); }
        catch { return 0; }
    }

    async user_follower_count_json(user: string): Promise<string> {
        return json.dumps({ followers: await this.user_follower_count(user) });
    }

    async user_about(user: string): Promise<string | null> {
        const url = this.user_url + user;
        if (this.url !== url) await this.__set_user_page(user, url);
        const about_tag = this.user_page.find(null, { class: 'aboutUser' });
        return about_tag ? about_tag.getText() : null;
    }

    async user_about_json(user: string): Promise<string> {
        return json.dumps({ about_user: await this.user_about(user) });
    }

    async user_rating_distribution(user: string): Promise<number[]> {
        const url = this.user_url + user;
        if (this.url !== url) await this.__set_user_page(user, url);
        const user_rating_distribution_tags = this.user_page.find_all(null, { class: 'distRow' });
        const user_rating_distribution: number[] = [];
        for (let i = 0; i < 11; i++) {
            let rating = user_rating_distribution_tags[i].getText();
            rating = rating.slice(i === 0 || i === 10 ? 3 : 5);
            rating = rating.replaceAll('\u00a0', '').replaceAll(',', '').trim();
            user_rating_distribution.push(rating ? int(rating) : 0);
        }
        return user_rating_distribution;
    }

    async user_rating_distribution_json(user: string): Promise<string> {
        const distribution = await this.user_rating_distribution(user);
        const labels = ['100', '90-99', '80-89', '70-79', '60-69', '50-59', '40-49', '30-39', '20-29', '10-19', '0-9'];
        return json.dumps(Object.fromEntries(labels.map((label, i) => [label, distribution[i]])));
    }

    async user_ratings(user: string, page = 1): Promise<UserRating[]> {
        const url = this.user_url + `${user}/ratings/${page}/`;
        await this.__set_user_page(user, url);
        const ratings = this.user_page.find_all(null, { class: 'albumBlock' });
        const result: UserRating[] = [];
        for (const entry of ratings) {
            const artist = entry.find(null, { class: 'artistTitle' })!.getText();
            const album = entry.find(null, { class: 'albumTitle' })!.getText();
            const rating = entry.find(null, { class: 'rating' })!.getText().trim();
            result.push({ artist, album, rating });
        }
        return result;
    }

    async user_ratings_json(user: string, page = 1): Promise<string> {
        return json.dumps({ ratings: await this.user_ratings(user, page) });
    }

    async user_ratings_all(user: string, max_pages: number | null = null): Promise<UserRating[]> {
        const all_ratings: UserRating[] = [];
        const seen_pages = new Set<string>();
        let page = 1;
        while (true) {
            if (max_pages && page > max_pages) break;
            const url = this.user_url + `${user}/ratings/${page}/`;
            await this.__set_user_page(user, url);
            const ratings = this.user_page.find_all(null, { class: 'albumBlock' });
            if (!ratings.length) break;
            const first_album = ratings[0].getText(true);
            if (seen_pages.has(first_album)) break;
            seen_pages.add(first_album);
            for (const entry of ratings) {
                const artist = entry.find(null, { class: 'artistTitle' })!.getText();
                const album = entry.find(null, { class: 'albumTitle' })!.getText();
                const rating = entry.find(null, { class: 'rating' })!.getText().trim();
                all_ratings.push({ artist, album, rating });
            }
            page += 1;
        }
        return all_ratings;
    }

    async user_perfect_scores(user: string): Promise<UserAlbum[]> {
        const url = this.user_url + user + '/ratings/perfect/';
        if (this.url !== url) await this.__set_user_page(user, url);
        const albums = this.user_page.find_all(null, { class: 'albumBlock' });
        const result: UserAlbum[] = [];
        for (const entry of albums) {
            const artist = entry.find(null, { class: 'artistTitle' })!.getText();
            const album = entry.find(null, { class: 'albumTitle' })!.getText();
            result.push({ artist, album });
        }
        return result;
    }

    async user_perfect_scores_json(user: string): Promise<string> {
        return json.dumps({ 'perfect scores': await this.user_perfect_scores(user) });
    }

    async user_liked_music(user: string): Promise<UserAlbum[]> {
        const url = this.user_url + user + '/liked/albums/';
        if (this.url !== url) await this.__set_user_page(user, url);
        const albums = this.user_page.find_all(null, { class: 'albumBlock' });
        const result: UserAlbum[] = [];
        for (const entry of albums) {
            const artist = entry.find(null, { class: 'artistTitle' })!.getText();
            const album = entry.find(null, { class: 'albumTitle' })!.getText();
            result.push({ artist, album });
        }
        return result;
    }

    async user_liked_music_json(user: string): Promise<string> {
        return json.dumps({ 'liked music': await this.user_liked_music(user) });
    }

    async user_favorites(user: string): Promise<UserAlbum[]> {
        const url = this.user_url + user;
        if (this.url !== url) await this.__set_user_page(user, url);
        const fav_block = this.user_page.find(null, { id: 'favBlock' });
        if (!fav_block) return [];
        const result: UserAlbum[] = [];
        for (const entry of fav_block.find_all(null, { class: 'albumBlock' })) {
            const artist_tag = entry.find(null, { class: 'artistTitle' });
            const album_tag = entry.find(null, { class: 'albumTitle' });
            if (artist_tag && album_tag) result.push({ artist: artist_tag.getText(), album: album_tag.getText() });
        }
        return result;
    }

    async user_favorites_json(user: string): Promise<string> {
        return json.dumps({ favorites: await this.user_favorites(user) });
    }

    async user_reviews(user: string, page?: number, as_json?: false): Promise<UserReview[]>;
    async user_reviews(user: string, page: number | undefined, as_json: true): Promise<string>;
    async user_reviews(user: string, page: number | undefined, as_json: boolean): Promise<UserReview[] | string>;
    async user_reviews(user: string, page = 1, as_json = false): Promise<UserReview[] | string> {
        const url = this.user_url + `${user}/reviews/${page}/`;
        await this.__set_user_page(user, url);
        const entries = this.user_page.find_all(null, { class: 'albumReviewRow' });
        const result: UserReview[] = [];
        for (const entry of entries) {
            const artist = entry.find(null, { class: 'artistTitle' })!.getText();
            const album = entry.find(null, { class: 'albumTitle' })!.getText();
            const rating_tag = entry.find(null, { class: 'rating' });
            const rating = rating_tag ? rating_tag.getText().trim() : '';
            const review_div = entry.find(null, { class: 'albumReviewText' });
            let review_text = review_div ? review_div.get_text('\n', true) : '';
            if (review_text.endsWith('\nread more')) review_text = review_text.slice(0, -'\nread more'.length);
            result.push({ artist, album, rating, review: review_text });
        }
        if (as_json) return json.dumps({ reviews: result });
        return result;
    }
}
