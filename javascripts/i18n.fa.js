jquery_lang_js.prototype.lang.fa = {
    'AmirAli Akbari': 'امیرعلی اکبری',
    'Latest': 'آخرین مطالب',
    '[Aug 18]': '[۲۷ مرداد]',
    'Android Feature Location': 'یافتن خودکار مکان یک ویژگی نرم‌افزاری در کد پروژه‌های اندرویدی',
    'Find me on:': 'یافتن من در:',
    'Content licensed under': 'استفاده از مطالب با ذکر منبع بلامانع است:'
};

jquery_lang_js.prototype.lang.fa.bidiHandler = {
    rtl: true,
    setup: function () {
        $(':header, div, p').css('font-family', "BNazanin, 'B Nazanin', Tahoma, serif");
    },
    rollback: function () {
        $(':header, div, p').css('font-family', '');
    }
};
