# Klinik CRM Sistemi

Bu proje, demo amaçlı, frontend-odaklı, kapsamlı bir klinik yönetim sistemi olup, SvelteKit, shadcn-svelte, Tailwind CSS ve TypeScript teknolojilerini kullanarak geliştirilmiştir.

## Proje Özeti

-   **Amaç:** Demo amaçlı, modern ve kullanıcı dostu bir klinik yönetim sistemi arayüzü sunmak. Gerçek bir backend entegrasyonu yerine mock API ve seed data kullanılmıştır.
-   **Teknoloji:** SvelteKit + shadcn-svelte + Tailwind CSS + TypeScript
-   **Özellikler:**
    -   İki dilli destek (Türkçe/İngilizce)
    -   Dark/Light mode
    -   Tam responsive tasarım (mobil/tablet/desktop)
    -   Özelleştirilebilir branding (ayarlar üzerinden)
    -   WCAG erişilebilirlik standartlarına uyum
    -   Mock authentication ve kapsamlı seed data

## Kurulum ve Çalıştırma

Projeyi yerel ortamınızda kurmak ve çalıştırmak için aşağıdaki adımları izleyin.

### 1. Projeyi Klonlayın ve Bağımlılıkları Kurun

```bash
# Projeyi klonlayın
git clone <repository-url> clinic-crm
cd clinic-crm

# Bağımlılıkları kurun
npm install
```

### 2. Geliştirme Ortamını Başlatın

```bash
npm run dev
```

Bu komut, geliştirme sunucusunu başlatacak ve uygulamayı genellikle `http://localhost:5173` adresinde açacaktır.

### 3. Üretim Ortamı İçin Derleme

```bash
npm run build
```

Uygulamanın üretim sürümünü derler. Derlenen sürümü önizlemek için:

```bash
npm run preview
```

## Demo Kullanıcı Bilgileri

Uygulamaya giriş yapmak için aşağıdaki mock kullanıcı bilgilerini kullanabilirsiniz:

-   **Yönetici (Admin)**
    -   Email: `admin@klinik.com`
    -   Şifre: `admin123`
-   **Doktor (Doctor)**
    -   Email: `dr.ayse@klinik.com`
    -   Şifre: `doctor123`

Diğer roller için `src/lib/data/users.ts` dosyasını inceleyebilirsiniz.

## Proje Yapısı

Proje yapısı hakkında detaylı bilgi için `GEMINI.md` dosyasını inceleyebilirsiniz.

## Geliştirme Notları

-   Tüm veri in-memory olarak saklandığından, sayfa yenilendiğinde veriler sıfırlanır (demo amaçlı).
-   Gerçek bir backend entegrasyonu için `src/lib/services/mockApi.ts` dosyasının değiştirilmesi gerekmektedir.
-   Mock API'de 300ms gecikme simülasyonu bulunmaktadır.
-   Seed data her uygulama başlangıcında yüklenir.
-   TypeScript strict mode aktiftir.
-   Tüm formlar Zod ile doğrulanmıştır.
-   shadcn-svelte bileşenleri kullanılarak modern bir UI/UX sağlanmıştır.