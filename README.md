# Портфолио — как править и как выложить

Статичный сайт без сборки: `index.html` + `style.css` + `assets/` (≈11 МБ, из них 10 МБ — геймплей-ролик).
Языки EN/RU переключаются кнопкой, выбор запоминается; по умолчанию — язык браузера.

## Контакты
Email и LinkedIn — в блоке `<section id="contact">` в `index.html`. Ссылки Steam и YouTube-трейлера у It's our FIELD закомментированы — раскомментируй, когда будут готовы.

## Как добавить ссылку или проект
- Ссылка у проекта: внутри карточки блок `<div class="links">…</div>` — добавь `<a href="..." target="_blank" rel="noopener">Название ↗</a>`.
- Новый проект: скопируй любой `<article class="card">…</article>`, поменяй картинку в `assets/` и тексты (у каждого текста две версии: `lang="en"` и `lang="ru"`).
- Картинки держи ≤ 1600 px и ≤ 300 КБ (jpg/webp), видео — ≤ 15 МБ или выкладывай на YouTube и вставляй ссылкой.

## Посмотреть локально
```bash
cd ~/Desktop/projects/portfolio && python3 -m http.server 8000
```
Открой http://localhost:8000

## Хостинг (всё бесплатно)

### GitHub Pages (так сайт и выложен)
Сайт: **https://begod24.github.io/portfolio/**, репозиторий `begod24/portfolio`, Pages собирается из ветки `main`, папка `/ (root)`.
Обновить сайт — в этой папке:
```bash
git add . && git commit -m "Update" && git push
```
Через 1–2 минуты изменения на сайте.

Чтобы адрес был короче (`https://begod24.github.io`): Settings → General → переименуй репозиторий в `begod24.github.io`, потом `git remote set-url origin git@github.com:begod24/begod24.github.io.git`.

### Альтернативы
- **Cloudflare Pages** — бесплатно, очень быстрый, можно просто перетащить папку в браузере (Workers & Pages → Create → Upload assets). Адрес вида `имя.pages.dev`.
- **Netlify** — тоже drag-and-drop (app.netlify.com/drop), адрес `имя.netlify.app`.
- **itch.io** — можно сделать HTML-страницу, но для портфолио хуже: нет своего адреса и чужой интерфейс вокруг.

### Свой домен (по желанию, ~$10–15 в год)
Например `neonyurt.com` или `bekbolat.dev`. Покупать у Cloudflare Registrar или Porkbun (продают по себестоимости, без наценки на продление).
Подключение: GitHub → Settings → Pages → Custom domain, у регистратора — запись `CNAME www → begod24.github.io` и 4 записи `A` для корня (адреса GitHub указаны в их справке «Managing a custom domain»). HTTPS включается галочкой бесплатно.

## Что ещё стоит добавить потом
- Фото или аватар в «Обо мне».
- Короткие гифки комбо и боссов.
- Страницу Steam, когда она станет публичной.
