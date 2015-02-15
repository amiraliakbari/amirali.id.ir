if (typeof jquery_lang_js !== 'undefined') {
    window.lang = new jquery_lang_js();
}

function updateLang () {
    $('#item-details').html('<p class="lang en-only">for more information on each item, move mouse over it, and click to view.</p><p class="lang fa-only">برای اطلاعات بیشتر موس را روی هر گزینه ببرید، و برای ورود روی آن کلیک کنید.</p>');
    $('.lang').removeClass('lang-active').addClass('lang-unactive');
    $('.' + window.lang.currentLang + '-only').removeClass('lang-unactive').addClass('lang-active');
}

$(function () {
    if (typeof window.lang !== 'undefined') {
        // translation
        window.lang.run();
        updateLang();

        // language switch-button
        var $langSel = $('#lang-select');
        $langSel.bootstrapSwitch('setState', window.lang.currentLang == 'en', true);
        $langSel.show();
        $langSel.on('switch-change', function (e, data) {
            var clang = data.value ? 'en' : 'fa';
            window.lang.change(clang);
            updateLang();
        });
    }

    // my emails
    var myEmail = 'amiraliakbari';
    $('#item-gmail').attr('href', 'mailto:' + myEmail + '@gmail.com');
    $('#ico-arsh').attr('href', 'mailto:' + myEmail.substring(7) + '@arsh.co.ir');

    $('.showcase .item').tooltip();

    var pDetails = {};
    pDetails.en = {
        learn: "A collection of best programming articles that anyone must read",
        fl: "My BSc project: Feature Location in Android Applications"
    };
    pDetails.fa = {
        learn: "مجموعه‌ای از بهترین مقالات مرتبط با بارنامه‌نویسی که هر کسی باید بخواند",
        fl: "پروژه‌ی کارشناسی من: یافتن ویژگی‌های نرم‌افزاری در برنامه‌های اندروید"
    };
    $('#projects-div.showcase .item').mouseenter(function () {
        var t = pDetails[window.lang.currentLang][$(this).data('pid')] || '';
        $('#item-details').html('<p>' + t + '</p>');
    });
    $('#projects-div.showcase').mouseleave(function () {
        $('#item-details').html(window.lang.currentLang == 'en' ? '<p>for more information on each item, move mouse over it, and click to view.</p>' : '<p>برای اطلاعات بیشتر موس را روی هر گزینه ببرید، و برای ورود روی آن کلیک کنید.</p>');
    });
});
