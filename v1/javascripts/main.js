if (typeof jquery_lang_js !== 'undefined') {
    window.lang = new jquery_lang_js();
}

function getLang() {
    if (typeof window.lang == 'undefined')
        return 'en';
    return window.lang.currentLang;
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
        cv: "My CV",
        learn: "A collection of best programming articles that anyone must read",
        fl: "My BSc project: Feature Location in Android Applications",
        almizan: "Almizan Quran Tafsir (Farsi)"
    };
    pDetails.fa = {
        cv: "رزومه من",
        learn: "مجموعه‌ای از بهترین مقالات مرتبط با بارنامه‌نویسی که هر کسی باید بخواند",
        fl: "پروژه‌ی کارشناسی من: یافتن ویژگی‌های نرم‌افزاری در برنامه‌های اندروید",
        almizan: "نسخه‌ای آنلاین از تفسیر المیزان برای دسترسی و مطالعه‌ی ساده‌تر"
    };
    $('#projects-div.showcase .item').mouseenter(function () {
        var t = pDetails[getLang()][$(this).data('pid')] || '';
        $('#item-details').html('<p>' + t + '</p>');
    });
    $('#projects-div.showcase').mouseleave(function () {
        var is_en = getLang() == 'en';
        $('#item-details').html(is_en ? '<p>for more information on each item, move mouse over it, and click to view.</p>' : '<p>برای اطلاعات بیشتر موس را روی هر گزینه ببرید، و برای ورود روی آن کلیک کنید.</p>');
    });
});

var fbase;

function authCallback (data) {
    var name;
    if (!data) {
        $('#login-button').show();
        name = 'Anonymous';
    } else {
        $('#login-button').hide();
        name = data.google.displayName;
    }
    $('#username').text(name);
}

$(function () {
    $('#login-button').hide();
    /*fbase = new Firebase("https://glaring-fire-7735.firebaseio.com");

    $('#login-button').click(function () {
        fbase.authWithOAuthRedirect("google", function(error) {
            if (error) {
                console.log("Login Failed!", error);
            } else {
            }
        });
    });

    fbase.onAuth(authCallback);*/
});
