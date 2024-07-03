type UserProfile = {
  country: string;
  display_name: string;
  email: string;
  explicit_content: {
    filter_enabled: boolean;
    filter_locked: boolean;
  };
  external_urls: { spotify: string };
  followers: { href: string; total: number };
  href: string;
  id: string;
  images: {
    url: string;
    height: number;
    width: number;
  }[];
  product: string;
  type: string;
  uri: string;
};

type TokenResponse = {
  access_token: string;
  refresh_token: string;
};

type Playlist = {
  name: string;
  uri: string;
};

type PlaylistRequest = {
  items: Playlist[];
};

type Category = {
  href: any;
  items: any;
  icons: any;
  id: string;
  name: string;
};

type CategoryResponse = {
  categories: {
    items: Category[];
  };
};

type TopGenresResponse = {
  items: {
    genres: string[];
  }[];
};

type UserTopGenres = string[];
