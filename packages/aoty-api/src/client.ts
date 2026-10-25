/** All methods used to get site data. */
import { UserMethods } from './user.js';
import { ArtistMethods } from './artist.js';
import { AlbumMethods } from './album.js';
import { GenreMethods } from './genre.js';
import { RatingsMethods } from './ratings.js';
import { clear_cookies, set_cookies, type Cookies } from './http.js';
import { mixin } from './compat.js';

// TypeScript has single inheritance; merge public instance types and copy the
// prototypes to preserve the original five standalone method classes.
type UserAPI = Pick<UserMethods, keyof UserMethods>;
type ArtistAPI = Pick<ArtistMethods, keyof ArtistMethods>;
type AlbumAPI = Pick<AlbumMethods, keyof AlbumMethods>;
type GenreAPI = Pick<GenreMethods, keyof GenreMethods>;
type RatingsAPI = Pick<RatingsMethods, keyof RatingsMethods>;
export interface AOTY extends UserAPI, ArtistAPI, AlbumAPI, GenreAPI, RatingsAPI {}
export class AOTY {
    constructor(cookies: Cookies = null, user_agent: string | null = null) {
        Object.assign(this, new UserMethods(), new ArtistMethods(), new AlbumMethods(), new GenreMethods(), new RatingsMethods());
        if (cookies !== null || user_agent !== null) set_cookies(cookies, user_agent);
    }
    set_cookies(cookies: Cookies = null, user_agent: string | null = null, replace = true): void {
        set_cookies(cookies, user_agent, replace);
    }
    clear_cookies(): void { clear_cookies(); }
}
mixin(AOTY, [UserMethods, ArtistMethods, AlbumMethods, GenreMethods, RatingsMethods]);
