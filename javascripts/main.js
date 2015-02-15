if (typeof jquery_lang_js !== 'undefined') {
    window.lang = new jquery_lang_js();
}

$(function () {
    if (typeof window.lang !== 'undefined') {
        // translation
        window.lang.run();

        // language switch-button
        var $langSel = $('#lang-select');
        $langSel.bootstrapSwitch('setState', window.lang.currentLang == 'en', true);
        $langSel.show();
        $langSel.on('switch-change', function (e, data) {
            var clang = data.value ? 'en' : 'fa';
            window.lang.change(clang);
            $('.lang').removeClass('lang-active').addClass('lang-unactive');
            $('.' + clang + '-only').removeClass('lang-unactive').addClass('lang-active');
        });
    }

    // my emails
    var myEmail = 'amiraliakbari';
    $('#ico-gmail').attr('href', 'mailto:' + myEmail + '@gmail.com');
    $('#ico-arsh').attr('href', 'mailto:' + myEmail.substring(7) + '@arsh.co.ir');

    $('#accounts-div a').tooltip();
});
