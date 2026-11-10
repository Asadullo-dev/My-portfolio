# ASADULLO — Cybersecurity Portfolio

A dark premium, multilingual (UZ / EN / DE) personal portfolio for an aspiring ethical hacker and penetration tester. Built with HTML5, CSS3 and vanilla JavaScript (ES modules). No frameworks, no backend.

## Features

- Dark Premium design with glassmorphism, subtle glow and interactive cards
- Animated hero with typing effect and subtle network canvas
- Language switcher (UZ default, EN, DE), choice saved in `localStorage`
- Sections: About, Specialization, Tech Stack, Learning Roadmap, Labs & CTF, Projects, Writeups, Contact
- Contact form with client-side validation (sends only when an endpoint is configured)
- Responsive layout with mobile menu, active-section highlighting, back-to-top button
- Respects `prefers-reduced-motion`
- Semantic HTML, SEO metadata, accessible focus styles

## Technologies

HTML5, CSS3 (custom properties), JavaScript ES modules, Google Fonts (Space Grotesk, Inter).

## Installation

Clone the repository and open the folder. ES modules require the site to be served over HTTP, so opening `index.html` directly from the file system may not load the scripts. Use any static server:

```bash
cd portfolio
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Project structure

```
portfolio/
├── index.html
├── README.md
├── LICENSE
├── css/            style.css, responsive.css, animations.css
├── js/             main.js, translations.js, config.js, projects.js, animations.js
└── assets/         images/, icons/, projects/
```

## Customization

1. Personal data: edit `js/config.js` (name, email, Telegram, GitHub, profile image path, contact endpoint).
2. Text in all three languages: edit `js/translations.js`. Each key exists in `uz`, `en` and `de`.
3. Learning stages and their status: edit `roadmapStages` in `js/translations.js`. Change `status` to `todo`, `active` or `done` manually.
4. Labs: edit `labs` in `js/translations.js`. Set `url` to `null` to show "coming soon".
5. Projects: edit `js/projects.js`. Set `github` and `demo` only when the real repository or demo exists; `null` shows a "coming soon" label instead of a fake link.
6. Writeups: add entries to `writeups` in `js/projects.js` with `title`, `category`, `date`, `description`, `tags` (each an object with `uz`, `en`, `de` for text fields).
7. Profile photo: replace `assets/images/profile-placeholder.svg` with your image and update `profileImage` in `config.js`.
8. Contact form: create a form on a service such as Formspree or Netlify Forms, then set its URL as `contactEndpoint` in `config.js`.

## GitHub Pages deployment

1. Create a repository, for example `portfolio`, and push the contents of the `portfolio/` folder to the `main` branch. The `index.html` file must be at the repository root.
2. On GitHub, open **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**, select `main` and folder `/ (root)`, then save.
4. After a minute the site is available at `https://<your-username>.github.io/<repository-name>/`.

All paths in the project are relative, so the site works under a repository sub-path without changes.

## License

See [LICENSE](LICENSE).
