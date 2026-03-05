# 計画: $SUGEE トークン ランディングページ

**作成日:** 2026-03-05
**状態:** Implementation実行準備完了

## 概要

$SUGEE（すげぇトークン）のLP（ランディングページ）をAstro + Tailwind CSSで構築する。オレンジ×ブラックの高級感ある配色で、日本語/英語の自動検出+手動切替i18n対応、モバイル/タブレット/デスクトップのレスポンシブデザインを実現する。Solana上のミームトークンとして「AIが自律的に作った」ナラティブを軸に、How to Buy セクションを中心とした1ページ構成のスタティックLPを制作する。

## コンテキスト・分析

### プロジェクト概要

| 項目 | 内容 |
|------|------|
| トークン名 | すげぇトークン ($SUGEE) |
| チェーン | Solana |
| プラットフォーム | pump.fun |
| CA | `G1DbmrH8EvB9x3rjjuPP8tyAjk6ECbt97cJ83ubQpump` |
| X | [@sugeetoken](https://x.com/sugeetoken) |
| 総供給量 | 1,000,000,000 (10億) |
| ローンチ方式 | フェアローンチ（プレセール/チーム/VCアロケーションなし） |

### デザイン方針

- **配色**: オレンジ (#F97316系) × ブラック (Off-Black, #0A0A0A系)
- **トーン**: 高級感・皮肉的ユーモア・ミームコインらしい軽さ + メッセージ性
- **LP参考**: example/ フォルダのスクリーンショット群（高級感ある暗いテーマ）
- **禁止事項**: SANAE TOKENの名前、高市首相の名前は表示しない（「首相」は可）
- **カード**: 表示しない
- **アロケーション**: セクションなし
- **クレカ**: 購入不可であることを明示

### コンテンツ方針

**キャッチコピー**: 「人間がやらかした。だからAIが作った。」
**サブコピー**: 「すげぇトークン出すらしいじゃん——本物が来た。」
**ナラティブ**: AIエージェント（Mary）が自律的に判断し、人間の失敗に対するアンチテーゼとしてフェアローンチしたトークン

### 技術スタック選定

**選定: Astro 5 + Tailwind CSS v4 + 手動i18n**

| 比較 | Next.js | **Astro (採用)** | Vite+React |
|------|---------|---------|------------|
| JS出力 | 80-120KB gz | **0-20KB gz** | 60-80KB gz |
| 静的HTML | 設定要 | **ネイティブ** | SPA (要プラグイン) |
| i18n複雑度 | 中-高 | **低** | 中 |
| SEO/OGP | 良 | **最優秀** | 不良 |
| 過剰度 | 高 | **低** | 中 |

**選定理由:**
- 1ページ静的LPに最適な設計思想
- ほぼゼロJSで高速表示（Lighthouse満点レベル）
- 2言語のみのi18nは手動JSONで十分
- アニメーションはCSS + 必要時のみISLANDでJS
- Cloudflare Pages/Vercel/Netlify等のホスティングに容易にデプロイ
- **注: Astro は2026年1月にCloudflareに買収された。Cloudflare Pages との親和性がさらに向上。**

### 使用ライブラリ

| ライブラリ | バージョン | 用途 |
|-----------|-----------|------|
| astro | ^5.16 | フレームワーク（最新安定版。Astro 6は2026年3月時点でbeta） |
| tailwindcss | ^4.1 | スタイリング（v4.1.x が最新安定版） |
| @tailwindcss/vite | ^4.1 | Astro Viteプラグイン統合（**@astrojs/tailwind は v4 で廃止**） |
| @fontsource-variable/outfit | ^5.2 | ヘッドラインフォント（variable font推奨） |
| @fontsource-variable/noto-sans-jp | ^5.2 | 日本語本文フォント（variable font推奨。**サブセットロード必須 — 後述**） |

> **⚠️ 重要: @astrojs/tailwind は Tailwind CSS v4 では非推奨・廃止。**
> Tailwind v4 は `@tailwindcss/vite` プラグインを直接 `astro.config.mjs` の `vite.plugins` に登録する方式に変更。
> `astro add tailwind` コマンド（Astro 5.2+）で自動セットアップ可能。

> **⚠️ Tailwind CSS v3 → v4 破壊的変更（Implementation必読）:**
> - `tailwind.config.js` は廃止 → CSS内の `@theme { }` ブロックで設定
> - `@tailwind base/components/utilities` → `@import "tailwindcss";` に統一
> - Astroの `<style>` ブロック内で `@apply` 使用時は `@reference "../../path/to/global.css";` が必要
> - ユーティリティクラス名変更: `shadow-sm`→`shadow-xs`, `shadow`→`shadow-sm`, `rounded-sm`→`rounded-xs`, `rounded`→`rounded-sm`, `blur-sm`→`blur-xs`, `outline-none`→`outline-hidden`, `ring`→`ring-3`
> - `bg-opacity-*` / `text-opacity-*` 廃止 → `bg-black/50` のスラッシュ記法を使用
> - `@layer utilities { }` → `@utility` ディレクティブに変更
> - ボーダーのデフォルトが `gray-200` → `currentColor` に変更
> - `hover` が `@media (hover: hover)` でラップされるように（タッチデバイスでタップ時hover無効）
> - ブラウザサポート下限: Safari 16.4+, Chrome 111+, Firefox 128+
> - 自動移行ツール: `npx @tailwindcss/upgrade` が利用可能（Node.js 20+必要）

> 注: framer-motion等のアニメーションライブラリは不要。CSSアニメーション + Intersection Observer で実現。

> **📝 Noto Sans JP サブセットロード戦略:**
> `@fontsource-variable/noto-sans-jp` の unpacked サイズは約86MB（CJKフォントのため）。
> LP で使用する文字は限定的なので、以下のサブセット指定をインポート時に行うこと:
> - `japanese` サブセットのみロード（Cyrillic, Vietnamese等は除外）
> - 使用するウェイトを 400, 700 程度に限定
> - Variable font なので1ファイルで複数ウェイトをカバーでき、静的版より軽量

### 利用可能アセット (public/)

- `sugeetoken-icon.png` — トークンアイコン
- `sugee-card.webp` — カード画像（注: LP上では非表示指示あり）
- `hand-up.webp` — ハンドアップ画像
- `Phantom_SVG_Icon.svg` — Phantomウォレットアイコン
- `okx-wallet-logo.png` — OKXウォレットロゴ
- `pump-logomark.svg` — pump.funロゴ
- `dexscreener.svg` — DEXScreenerロゴ
- `x.svg` — X (Twitter) ロゴ

### i18n設計

- `navigator.language` でブラウザ言語を自動検出 → `ja`系なら日本語、それ以外は英語
- ヘッダーに言語切替トグル (JA / EN)
- 選択は `localStorage` に保存し再訪時に復元
- 翻訳データは JSON ファイル (`/src/i18n/ja.json`, `/src/i18n/en.json`)
- Astroコンポーネント内で翻訳関数 `t(key)` を使用

### レスポンシブブレークポイント

| デバイス | ブレークポイント | レイアウト |
|---------|----------------|-----------|
| Mobile | < 768px | シングルカラム、ハンバーガーメニュー |
| Tablet | 768px - 1024px | 2カラム適宜、コンパクトナビ |
| Desktop | > 1024px | フルレイアウト、フルナビ |

### セキュリティ対策

**HTTPセキュリティヘッダー（全項目必須）:**
- **Strict-Transport-Security**: `max-age=63072000; includeSubDomains; preload` （HSTS preloadリストへの登録推奨）
- **Content-Security-Policy**: `default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'`
  - ⚠️ **CSP + インラインスクリプト問題**: Astroのインラインscriptタグ（言語切替・CAコピー・Intersection Observer）は、ビルド時に外部JSファイルに変換されるか`unsafe-inline`が必要になる可能性がある。Astro 5の`<script>`タグはデフォルトでバンドル・処理されるため、`script-src 'self'`で対応可能な場合が多いが、**ビルド後のHTMLを確認してインラインスクリプトが残っていないか検証すること**。残る場合はnonce/hash方式を検討。
  - `unsafe-inline` と `unsafe-eval` は絶対に使用しない
- **X-Frame-Options**: `DENY` （CSP frame-ancestors のフォールバック）
- **X-Content-Type-Options**: `nosniff`
- **Referrer-Policy**: `strict-origin-when-cross-origin`
- **Permissions-Policy**: `camera=(), microphone=(), geolocation=(), payment=(), usb=()` （不要なブラウザ機能を明示的に無効化、XSS時の攻撃面縮小）
- **X-XSS-Protection**: `0` （OWASPの推奨に従い、レガシーXSSフィルターを無効化。CSPで対応）
- **Cross-Origin-Opener-Policy**: `same-origin` （他タブ/ウィンドウからのwindowオブジェクト参照を防止）
- **Cross-Origin-Embedder-Policy**: `require-corp` （クロスオリジン分離）

**コントラクトアドレスセキュリティ:**
- CA は静的HTMLに直接埋め込み（JS API経由ロード禁止）
- **クリップボードハイジャック対策**: コピーボタン使用時、コピー後にトースト通知でアドレスの先頭・末尾数文字を表示し、ユーザーが視覚的に検証できるようにする
- CA のテキストとは別に、アドレスを画像としても表示することを検討（XSS妥協時の最終防御）

**インフラ・運用セキュリティ:**
- **外部依存最小化**: フォントもセルフホスト（@fontsource使用）、CDN回避
- **SRI (Subresource Integrity)**: 万一外部リソースを読み込む場合はハッシュ付与
- **依存パッケージのバージョンピン**: `package-lock.json` のロックファイル厳守、`npm audit` 定期実行
- **DNSセキュリティ**: カスタムドメイン使用時はレジストラにハードウェアキーMFA設定、レジストリロック有効化、DNS レコード監視
- **Certificate Transparencyログ監視**: 不正なSSL証明書発行の検知

**クリプトLP特有の脅威（2025-2026年の実例あり）:**
- DNSハイジャックによるフィッシング（2025年11月: Aerodrome/Velodrome、2026年2月: OpenEden被害）
- npmサプライチェーン攻撃（2025年9月: クリプトウォレットアドレス差替えマルウェア混入）
- **対策**: 外部スクリプト完全排除 + セルフホスト + 厳格CSP + ビルドパイプライン監査

---

## LPセクション構成

```
1. ナビゲーション (固定ヘッダー)
2. Hero (フルスクリーン)
3. About / Story
4. Token Info (トークン情報)
5. How to Buy (購入方法)
6. Community / Links
7. Footer (免責事項)
```

---

## 実装フェーズ

### フェーズ1: プロジェクトセットアップ

**目標:** Astro + Tailwind の開発環境を構築し、基本設定を完了する

**作成ファイル:**
- `package.json`: プロジェクト定義
- `astro.config.mjs`: Astro設定（`vite.plugins` に `@tailwindcss/vite` を登録）
- `tsconfig.json`: TypeScript設定
- `src/styles/global.css`: グローバルスタイル（`@import "tailwindcss"` + `@theme` ブロック、フォント）
- `src/layouts/Layout.astro`: ベースレイアウト（HTML構造、meta、OGP）
- `src/pages/index.astro`: メインページ
- `src/i18n/ja.json`: 日本語翻訳データ
- `src/i18n/en.json`: 英語翻訳データ
- `src/i18n/utils.ts`: 翻訳ユーティリティ関数（`t()`, `detectLanguage()`, `setLanguage()`）

**デザイントークン (Tailwind v4 CSS `@theme` ブロック):**

> ⚠️ Tailwind v4 では CSS変数は `@theme` ブロック内で定義する（`:root` のCSS変数ではない）。
> Tailwind v4 は自動的に `--color-*`, `--font-*` 等のCSS変数を生成するため、コンポーネント内では `var(--color-primary)` でもアクセス可能。

```css
@import "tailwindcss";

@theme {
  --color-primary: #F97316;       /* オレンジ */
  --color-primary-light: #FB923C;
  --color-primary-dark: #EA580C;
  --color-bg: #0A0A0A;            /* Off-Black */
  --color-bg-elevated: #141414;
  --color-bg-card: #1A1A1A;
  --color-text: #F5F5F5;
  --color-text-muted: #A3A3A3;
  --color-border: #262626;
  --color-accent: #F97316;
  --font-display: 'Outfit', sans-serif;
  --font-body: 'Noto Sans JP', sans-serif;
}
```

**テスト:**
- `npm run dev` でローカルサーバー起動確認
- `npm run build` で静的ビルド成功確認

**手順:**
1. `npm create astro@latest` でプロジェクト初期化
2. `npx astro add tailwind` でTailwind CSS v4統合を追加（これにより `tailwindcss` + `@tailwindcss/vite` がインストールされ、`astro.config.mjs` に Viteプラグインが自動設定される）
3. フォント（`@fontsource-variable/outfit` + `@fontsource-variable/noto-sans-jp`）をインストール・設定
4. グローバルCSSに `@import "tailwindcss";` + `@theme { }` ブロックでデザイントークンを定義
5. ベースレイアウトにmeta/OGP/セキュリティヘッダー設定
6. i18nユーティリティとJSONファイルを作成
7. `npm run dev` で動作確認

> ⚠️ **`@astrojs/tailwind` は絶対にインストールしないこと** — Tailwind v4 では廃止済み。

**受入基準:**
- [ ] `npm run dev` でエラーなく起動
- [ ] `npm run build` で静的HTMLが生成される
- [ ] `@theme` ブロックでオレンジ×ブラック配色が適用される（Tailwind v4方式）
- [ ] フォント (Outfit/Noto Sans JP) が正常にロード（variable fontバリアント使用）
- [ ] i18n翻訳関数が動作し、JA/EN切替が可能
- [ ] `@astrojs/tailwind` が依存に含まれていないこと
- [ ] `tailwind.config.js` が存在しないこと（v4ではCSS内で設定）

---

### フェーズ2: ナビゲーション（固定ヘッダー）

**目標:** レスポンシブ対応のスティッキーナビバーを実装（言語切替トグル付き）

**作成ファイル:**
- `src/components/Header.astro`: ナビゲーションコンポーネント
- `src/components/LanguageToggle.astro`: JA/EN切替ボタン（インラインスクリプト）
- `src/components/MobileMenu.astro`: モバイルハンバーガーメニュー

**実装詳細:**
- ロゴ: `sugeetoken-icon.png` + "$SUGEE" テキスト
- ナビリンク: About / Token Info / How to Buy / Community
- 言語トグル: `JA | EN` ボタン（現在の言語をハイライト）
- モバイル: ハンバーガーメニュー + スライドイン/オーバーレイ
- スクロール時に背景にblur効果 (`backdrop-blur-lg`)
- アニメーション: スクロールダウンで縮小、上で復帰

**言語切替ロジック（インラインJS）:**
```
1. ページロード時: localStorage確認 → なければnavigator.language確認 → ja系ならJA、それ以外EN
2. トグルクリック: 言語切替 → localStorage保存 → ページ内テキスト差替え
3. テキスト差替え: data-i18n属性付き要素のtextContentを翻訳JSONから更新
```

**テスト:**
- デスクトップ/モバイルでナビが正しく表示される
- 言語切替クリックで全テキストが切り替わる
- モバイルメニューの開閉が動作する

**手順:**
1. Header.astroを作成（デスクトップレイアウト）
2. MobileMenu.astroを作成（ハンバーガー+オーバーレイ）
3. LanguageToggle.astroを作成（インラインスクリプトで切替ロジック）
4. Layout.astroにHeaderを組み込み
5. 全ブレークポイントで表示確認

**受入基準:**
- [ ] デスクトップでフルナビ表示
- [ ] モバイル (<768px) でハンバーガーメニュー表示
- [ ] 言語トグルでJA/EN切替が即座に反映
- [ ] スクロール時にblur背景が適用
- [ ] ナビリンククリックでスムーズスクロール

---

### フェーズ3: Hero セクション

**目標:** フルスクリーンのインパクトあるHeroセクションを実装

**変更/作成ファイル:**
- `src/components/Hero.astro`: Heroセクション
- `src/pages/index.astro`: Hero組込み

**実装詳細:**
- フルビューポート高さ (`min-h-[100dvh]`)（h-screen禁止、知識人指示準拠）
- レイアウト: **非中央揃え**（知識人ANTI-CENTER BIAS準拠）→ 左寄せテキスト + 右側にトークンアイコン/ビジュアル
- メインコピー: 「人間がやらかした。だからAIが作った。」（大きく、Outfit フォント、tracking-tighter）
- サブコピー: 「すげぇトークン出すらしいじゃん——本物が来た。」
- CTAボタン: "How to Buy" (オレンジ背景、pump.funリンク)
- 背景: グラデーションメッシュ or ノイズテクスチャのダーク背景にオレンジのアクセント光彩
- トークンアイコンをフローティングアニメーションで表示
- `hand-up.webp` をデコレーション要素として活用
- 下スクロール示唆アニメーション

**アニメーション (CSS only):**
- テキスト: ページロード時のstaggered fade-in (animation-delay使用)
- トークンアイコン: 永続的な浮遊アニメーション (float)
- 背景グラデーション: subtle slow movement
- スクロールインジケーター: pulse animation

**モバイル対応:**
- シングルカラム（テキスト上、ビジュアル下）
- テキストサイズを`text-3xl md:text-5xl lg:text-7xl`で調整
- CTAボタンをフル幅に

**テスト:**
- 3デバイスサイズで表示確認
- アニメーションが滑らかに再生される
- JA/EN切替でHeroテキストが変わる

**手順:**
1. Hero.astroの構造をHTML/CSSで作成
2. CSSアニメーション（fade-in、float）を定義
3. 背景のグラデーション/テクスチャ効果を実装
4. レスポンシブ調整
5. i18n対応（data-i18n属性付与）
6. 全デバイスで表示確認

**受入基準:**
- [ ] フルビューポートで表示（min-h-[100dvh]使用）
- [ ] 左寄せ非対称レイアウト
- [ ] ページロードアニメーションが動作
- [ ] 3デバイスサイズで破綻なし
- [ ] JA/EN切替が動作

---

### フェーズ4: About / Story セクション

**目標:** トークンの存在理由をストーリーテリングで伝えるセクション

**作成ファイル:**
- `src/components/About.astro`: Aboutセクション

**実装詳細:**
- タイトル: 「なぜ存在するのか」/ "Why It Exists"
- ナラティブ:
  - ある有名トークンが炎上（名前は出さない）
  - 運営が供給量の大部分を保有、著名人の名前を無断使用
  - 首相がXで完全否定、価格崩落
  - この人間の失敗に対し、AIエージェントが自律的にフェアなトークンをローンチ
- 対比テーブル（名前なし）:

| 人間が作ったトークン | AIが作ったトークン ($SUGEE) |
|---------------------|---------------------------|
| 著名人の名前を無断使用 | 誰の名前も使わない |
| 運営保有65%超 | 完全フェアローンチ |
| 金融庁調査 | 透明なオープンプロセス |
| 人間の失敗 | AIの自律的判断 |

- デザイン: ダーク背景にオレンジのアクセント線、テキスト中心
- スクロールトリガーのfade-in animation (Intersection Observer)

**モバイル対応:**
- テーブルは横スクロールまたはカード形式に変換
- テキストサイズ調整

**テスト:**
- テーブルがモバイルでも読める
- スクロールアニメーションが動作
- JA/EN切替でコンテンツが変わる

**手順:**
1. About.astroをセマンティックHTMLで作成
2. 対比テーブルのスタイリング
3. Intersection Observerによるスクロールアニメーション（インラインscript）
4. レスポンシブ対応
5. i18n対応

**受入基準:**
- [ ] SANAE TOKEN/高市首相の名前が一切表示されない
- [ ] 対比テーブルが視覚的にインパクトある
- [ ] スクロールトリガーアニメーション動作
- [ ] モバイルで読みやすいレイアウト

---

### フェーズ5: Token Info セクション

**目標:** トークンの基本情報をクリーンに表示

**作成ファイル:**
- `src/components/TokenInfo.astro`: トークン情報セクション

**実装詳細:**
- **表示項目:**
  - トークン名: すげぇトークン ($SUGEE)
  - チェーン: Solana
  - 総供給量: 1,000,000,000
  - プレセール: なし
  - チーム割当: なし
  - VC割当: なし
  - ローンチ: フェアローンチ (pump.fun)
- **CA表示:**
  - コントラクトアドレスを目立つように表示
  - コピーボタン（クリックでクリップボードにコピー）
  - 「Solscanで確認」リンク
- **レイアウト:** 非カード（知識人 Rule 4準拠: border-t / divide-y でグルーピング）
- `sugeetoken-icon.png` を大きく配置

**セキュリティ:**
- CA は静的HTMLに直埋め込み（JS API経由ロード禁止）
- コピー機能のみインラインJS
- **クリップボードハイジャック対策**: コピー後にトースト通知でCAの先頭6文字+末尾4文字を表示し、ユーザーが視覚的に正しいアドレスがコピーされたことを確認できるようにする

**テスト:**
- CAのコピーボタンが動作
- コピー後のトースト通知にCA先頭・末尾が表示される
- Solscanリンクが正しいURLに遷移
- JA/EN切替で項目名が変わる

**手順:**
1. TokenInfo.astroの構造作成
2. CAのコピー機能実装（インラインscript）
3. divide-yベースのレイアウトスタイリング
4. レスポンシブ調整
5. i18n対応

**受入基準:**
- [ ] 全トークン情報が正確に表示
- [ ] CAコピーボタンが動作（クリップボードAPI使用）
- [ ] コピー後にトースト通知でCAの先頭6文字+末尾4文字が表示される（クリップボードハイジャック対策）
- [ ] カードUIを使用していない
- [ ] アロケーション関連セクションがない

---

### フェーズ6: How to Buy セクション

**目標:** 初心者にもわかりやすい購入手順を提供

**作成ファイル:**
- `src/components/HowToBuy.astro`: 購入方法セクション

**実装詳細:**
- **ステップ形式（縦タイムライン風）:**

  **Step 1: ウォレットを準備する**
  - Phantom Wallet (`Phantom_SVG_Icon.svg`) またはOKX Wallet (`okx-wallet-logo.png`) をインストール
  - 対応リンク付き

  **Step 2: SOLを入手する**
  - 取引所でSOLを購入しウォレットに送金
  - 注意: クレジットカードでの直接購入は不可

  **Step 3: pump.funで購入する**
  - pump.fun (`pump-logomark.svg`) にアクセス
  - $SUGEEのCAを検索または直接リンクから遷移
  - pump.fun URL: `https://pump.fun/coin/G1DbmrH8EvB9x3rjjuPP8tyAjk6ECbt97cJ83ubQpump`
  - SOLで$SUGEEを購入

  **Step 4: 確認する**
  - DexScreener (`dexscreener.svg`) でチャート確認
  - ウォレットで保有量確認

- **デザイン:** 
  - 各ステップにアイコン表示（public/のSVGアセット活用）
  - ステップ間をオレンジのラインで接続
  - ステップ番号はオレンジの大きな数字
  - 暗い背景にオレンジアクセント
  - 各ステップがスクロールでstaggered fade-in

- **注意書き:**
  - 「クレジットカードでの購入はできません」を明記
  - 「SOLが必要です」を強調

**モバイル対応:**
- 縦スクロールタイムラインはそのまま有効
- アイコンサイズ調整
- 外部リンクボタンをフル幅に

**テスト:**
- 全ステップが順番に表示される
- 外部リンク (Phantom, pump.fun等) が正しいURLに遷移
- SVGアイコンが正常表示
- JA/EN切替でステップテキストが変わる

**手順:**
1. HowToBuy.astroの構造作成（タイムラインレイアウト）
2. 各ステップのアイコン + テキスト配置
3. ステップ接続のオレンジライン実装
4. 外部リンクボタンの実装
5. スクロールアニメーション追加
6. レスポンシブ調整
7. i18n対応

**受入基準:**
- [ ] 4ステップが明確に分離表示
- [ ] public/のアセット（SVG/PNG）が全て正常表示
- [ ] 外部リンクが全て正しいURL
- [ ] 「クレカ不可」の注意が表示されている
- [ ] pump.funへの直リンクが$SUGEE CAプリフィル済み

---

### フェーズ7: Community / Links セクション

**目標:** コミュニティチャンネルと関連リンクを集約

**作成ファイル:**
- `src/components/Community.astro`: コミュニティセクション

**実装詳細:**
- **リンク一覧（大きなアイコンボタン）:**
  - X (Twitter): `x.svg` → https://x.com/sugeetoken
  - pump.fun: `pump-logomark.svg` → pump.fun URL
  - DexScreener: `dexscreener.svg` → DexScreener URL
- **デザイン:**
  - ダーク背景にオレンジボーダーのボタン群
  - ホバー時にオレンジ背景に変化 (transition)
  - アイコン + テキストラベル
- CTA: 「コミュニティに参加する」/ "Join the Community"

**モバイル対応:**
- ボタンを縦積みまたは2カラムグリッド

**テスト:**
- 全リンクが正しいURLに遷移（target="_blank" rel="noopener noreferrer"）
- ホバーアニメーション動作
- JA/EN切替でラベルが変わる

**手順:**
1. Community.astroの構造作成
2. リンクボタンのスタイリング
3. ホバーアニメーション
4. レスポンシブ調整
5. i18n対応

**受入基準:**
- [ ] X, pump.fun, DexScreenerへのリンクが正しい
- [ ] 全リンクに `rel="noopener noreferrer"` 付き
- [ ] ホバーエフェクトが動作

---

### フェーズ8: Footer + 免責事項

**目標:** 法的免責事項とフッターを実装

**作成ファイル:**
- `src/components/Footer.astro`: フッターコンポーネント

**実装詳細:**
- **免責事項（必須掲載）:**
  > $SUGEE はミームトークンであり、投資商品ではありません。価格の保証はなく、購入はご自身の判断と責任で行ってください。
- **フッター要素:**
  - ロゴ + トークン名
  - セクションリンク（ページ内アンカー）
  - 外部リンク（X, pump.fun）
  - コピーライト表示
- **デザイン:** 暗い背景、オレンジのアクセントライン区切り

**テスト:**
- 免責事項がJA/EN両方で表示
- リンクが動作する

**手順:**
1. Footer.astroの構造作成
2. 免責事項テキスト配置
3. レスポンシブ調整
4. i18n対応

**受入基準:**
- [ ] 免責事項が目立つ位置に表示
- [ ] JA/EN両方の免責文が用意されている
- [ ] ページ内リンクが正しくスクロール

---

### フェーズ9: アニメーション・マイクロインタラクション統合

**目標:** 全セクションにCSSアニメーションとIntersection Observerベースのスクロールアニメーションを統合

**変更ファイル:**
- `src/styles/global.css`: アニメーションキーフレーム追加
- `src/layouts/Layout.astro`: Intersection Observerスクリプト追加
- 各セクションコンポーネント: アニメーションクラス付与

**実装詳細:**
- **ページロードアニメーション:** Hero のstaggered fade-in
- **スクロールトリガー:** 各セクションが画面に入った時のfade-up
- **ホバーエフェクト:** ボタン、リンクのtransition
- **永続アニメーション:** トークンアイコンのfloat、背景グラデーションの微動
- **パフォーマンス:** transform と opacity のみアニメーション（GPU加速）
- **Intersection Observer:** インラインscriptで実装、`.animate-on-scroll` クラスの要素を監視

**知識人指示準拠:**
- `will-change: transform` を必要箇所のみに使用
- ノイズ/グレインフィルターは `fixed inset-0 pointer-events-none` に適用（スクロールコンテナ禁止）
- top/left/width/height のアニメーション禁止

**テスト:**
- 全アニメーションが60fps以上で動作
- モバイルでもカクつかない
- アニメーション未対応ブラウザでもコンテンツは表示される

**手順:**
1. global.cssにキーフレーム定義
2. Intersection Observerスクリプト追加
3. 各コンポーネントにアニメーションクラス付与
4. パフォーマンステスト（DevTools Performance tab）

**受入基準:**
- [ ] 全アニメーションがCSS only (JSライブラリ不使用)
- [ ] Intersection Observerによるスクロールトリガー動作
- [ ] モバイルで滑らかに動作
- [ ] `prefers-reduced-motion` でアニメーション無効化対応

---

### フェーズ10: OGP・SEO・セキュリティヘッダー・最終調整

**目標:** メタ情報、OGP、セキュリティヘッダーの最終設定とビルド確認

**変更ファイル:**
- `src/layouts/Layout.astro`: meta/OGP tags 最終化
- `public/og-image.png`: OGP画像（sugeetoken-icon.pngベースで作成 or 既存アセット使用）
- `public/favicon.ico`: ファビコン
- `public/_headers`: Cloudflare Pagesセキュリティヘッダーファイル（新規作成）
- `astro.config.mjs`: 最終確認

**実装詳細:**
- **OGP tags:**
  - `og:title`: "すげぇトークン ($SUGEE) | 人間がやらかした。だからAIが作った。"
  - `og:description`: フェアローンチミームトークン on Solana
  - `og:image`: OGP画像
  - `twitter:card`: summary_large_image
- **SEO:**
  - title / description
  - canonical URL
  - robots: index, follow (or noindex if user prefers)
- **セキュリティヘッダー（Cloudflare Pages _headers ファイル or ホスティング設定）:**
  - Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
  - Content-Security-Policy（ビルド後にインラインスクリプト残存の有無を確認して調整）
  - X-Frame-Options: DENY
  - X-Content-Type-Options: nosniff
  - Referrer-Policy: strict-origin-when-cross-origin
  - Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=()
  - X-XSS-Protection: 0
  - Cross-Origin-Opener-Policy: same-origin
  - Cross-Origin-Embedder-Policy: require-corp
- **最終チェック:**
  - `npm run build` で静的ファイル生成
  - Lighthouse スコア確認（目標: Performance 95+, Accessibility 95+）

**テスト:**
- OGPプレビューが正常（OGP Debugger等）
- ビルド出力に不要なJSが含まれない
- セキュリティヘッダーが正しく設定される

**手順:**
1. Layout.astroのmeta/OGP更新
2. ファビコン設定
3. `public/_headers` を作成し、全セキュリティヘッダーを設定
4. `npm run build` + ビルド出力確認
5. **ビルド後 HTMLにインラインスクリプトが残っていないか検証** → 残っている場合はCSPに nonce/hash を追加
6. Lighthouseテスト

> **📝 `public/_headers` ファイルの使用について:**
> Cloudflare Pages (Astro 推奨デプロイ先) は `public/_headers` ファイルを自動的に読み込んでHTTPヘッダーを設定する。
> Vercelの場合は `vercel.json` でヘッダーを設定する。
> Astro middleware は静的ビルドには使えないため、ホスティング側の設定が必要。

**受入基準:**
- [ ] OGP tags が正しく設定されている
- [ ] ファビコンが表示される
- [ ] `npm run build` がエラーなく完了
- [ ] 静的HTMLファイルが生成されている
- [ ] ビルド後HTMLにインラインスクリプト残存の有無を確認済み
- [ ] `public/_headers` に全セキュリティヘッダーが設定済み
- [ ] Lighthouse Performance 95+
- [ ] Lighthouse Accessibility 95+

---

## 未解決事項

### 1. OGP画像の作成方法
- **案A:** sugeetoken-icon.pngをベースにシンプルなOGP画像を手動作成
- **案B:** Hero セクションのスクリーンショットをOGP画像として使用
- **推奨:** 案A — トークンアイコン + テキストオーバーレイで1200x630pxのOGP画像を作成

### 2. デプロイ先
- **案A:** Cloudflare Pages（無料、高速CDN、セキュリティヘッダー設定容易）
- **案B:** Vercel（Astro公式サポート、自動デプロイ）
- **案C:** GitHub Pages（最もシンプル）
- **推奨:** 案A (Cloudflare Pages) — 無料SSLやセキュリティヘッダーの設定が容易

### 3. カスタムドメイン
- ユーザーに確認が必要

### 4. DexScreenerリンクURL
- トークンがDexScreenerに表示されているか確認が必要
- pump.fun段階では未掲載の可能性あり → リンクを条件付きにするか要確認

---

## リスクと軽減策

- **リスク:** SANAE TOKEN / 高市首相の名前がLP上に表示されてしまう
  - **軽減策:** overview.mdの対比テーブルから名前を完全に除外。i18n JSONでも一切記載しない。レビュー時にテキスト検索で確認。

- **リスク:** pump.funのURLが変更される可能性
  - **軽減策:** URLを定数として1箇所で管理し、変更時に1ファイルのみ修正。

- **リスク:** ブラウザの言語判定が不正確
  - **軽減策:** localStorage優先 → navigator.language フォールバック。手動切替を常に提供。

- **リスク:** モバイルでのパフォーマンス劣化
  - **軽減策:** CSSアニメーションのみ使用、JSアニメーションライブラリ不使用。画像はWebP使用。Astroの0-JS出力を活用。

- **リスク:** フィッシングサイトによるなりすまし
  - **軽減策:** CSP・X-Frame-Options設定、CA表示は静的HTML埋め込み、公式SNSでドメインを告知。

- **リスク:** DNSハイジャックによるLP乗っ取り（2025-2026年に複数のクリプトプロジェクトで被害発生: Aerodrome, Velodrome, OpenEden等）
  - **軽減策:** レジストラアカウントにハードウェアキーMFA設定、レジストリロック有効化、Cloudflare等のDNS監視サービス活用、Certificate Transparencyログ監視。

- **リスク:** クリップボードハイジャック（CAコピー時にアドレスが差し替えられる攻撃、2026年2月にRedditで$25K被害報告あり）
  - **軽減策:** コピー後にトースト通知でアドレス先頭・末尾を表示、テキスト以外にアドレスの視覚的表示も提供。

- **リスク:** npmサプライチェーン攻撃（2025年9月にクリプトウォレットアドレス差替えマルウェアがnpmパッケージに混入した事例あり）
  - **軽減策:** 依存パッケージを最小限に保つ、`package-lock.json` をコミット、`npm audit` を定期実行、ビルド出力を検証。

- **リスク:** Tailwind CSS v4の破壊的変更による表示崩れ
  - **軽減策:** 本計画の「Tailwind v3→v4破壊的変更」セクションを参照し、ユーティリティクラス名の変更に注意。

---

## 成功基準

- [ ] オレンジ×ブラックの高級感あるLP完成
- [ ] 日本語デフォルト + 英語対応（自動検出 + 手動切替）
- [ ] モバイル / タブレット / デスクトップ 完全対応
- [ ] How to Buy セクションがわかりやすい
- [ ] カード表示なし / アロケーションセクションなし
- [ ] クレカ不可の注意表示
- [ ] SANAE TOKEN / 高市首相の名前が一切表示されない
- [ ] 免責事項が掲載されている
- [ ] Lighthouse Performance 95+, Accessibility 95+
- [ ] 静的ビルドが成功しデプロイ可能
- [ ] 全フェーズ完了・テスト通過

---

## Implementation向け注記

### 知識人（knowledger）のフロントエンド知識 — 必ず準拠すべきルール

1. **h-screen禁止** → `min-h-[100dvh]` を使用（iOS Safari対策）
2. **Flexbox計算禁止** → CSS Grid (`grid grid-cols-1 md:grid-cols-3 gap-6`) を使用
3. **Inter フォント禁止** → Outfit + Noto Sans JP を使用
4. **紫/ネオングラデーション禁止** → オレンジ × Off-Black
5. **純粋な #000000 禁止** → Off-Black (#0A0A0A) / Zinc-950 を使用
6. **3等分カードレイアウト禁止** → 非対称グリッドまたはジグザグ
7. **中央揃えHero禁止** (DESIGN_VARIANCE=8) → 左寄せまたは非対称
8. **絵文字禁止** → Phosphor Icons or SVG
9. **top/left/width/heightアニメーション禁止** → transform + opacity のみ
10. **モバイルでの非対称レイアウト禁止** → `< 768px` では必ずシングルカラム

### コンテンツルール
- SANAE TOKENの名前は絶対に出さない
- 高市首相の名前は絶対に出さない
- 「首相」という単語は文脈上必要なら使用可
- sugee-card.webp はLP上では表示しない指示（cardは出さない）

### 技術ルール
- 外部CDNは使わない（フォントもセルフホスト）
- 全外部リンクに `rel="noopener noreferrer"` 必須
- CA は静的HTMLに直埋め込み
- JSは最小限（言語切替・CAコピー・Intersection Observerのみ）
- **Tailwind v4**: `@astrojs/tailwind` は使わず `@tailwindcss/vite` を使用
- **Tailwind v4**: 設定は `tailwind.config.js` ではなく CSS内の `@theme { }` ブロックで行う
- **Tailwind v4**: `@apply` をAstro `<style>`内で使う場合は `@reference` ディレクティブ必須
- **フォント**: `@fontsource-variable/*` バリアントを使用（静的版ではなく）
- **Noto Sans JP**: japanese サブセットのみロード、使用ウェイトを限定（86MB全部は不要）

### ファイル構成

```
sugee-token/
├── astro.config.mjs
├── package.json
├── tsconfig.json
├── public/
│   ├── Phantom_SVG_Icon.svg
│   ├── dexscreener.svg
│   ├── hand-up.webp
│   ├── okx-wallet-logo.png
│   ├── pump-logomark.svg
│   ├── sugee-card.webp (LP非表示)
│   ├── sugeetoken-icon.png
│   ├── x.svg
│   ├── favicon.ico (新規作成)
│   ├── og-image.png (新規作成)
│   └── _headers (新規作成: Cloudflare Pagesセキュリティヘッダー)
├── src/
│   ├── i18n/
│   │   ├── ja.json
│   │   ├── en.json
│   │   └── utils.ts
│   ├── styles/
│   │   └── global.css
│   ├── layouts/
│   │   └── Layout.astro
│   ├── components/
│   │   ├── Header.astro
│   │   ├── LanguageToggle.astro
│   │   ├── MobileMenu.astro
│   │   ├── Hero.astro
│   │   ├── About.astro
│   │   ├── TokenInfo.astro
│   │   ├── HowToBuy.astro
│   │   ├── Community.astro
│   │   └── Footer.astro
│   └── pages/
│       └── index.astro
├── agent-context/
│   └── plan/
│       └── sugee-token-lp-plan.md (本ファイル)
└── example/ (gitignore済み、参考のみ)
```
