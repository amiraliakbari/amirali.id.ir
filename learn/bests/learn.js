var resources = {
    js: [
        // 'Inheritance and the Prototype Chain', ['https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Inheritance_and_the_prototype_chain'], 'The basic of JS OOP model, introducing the prototype chain'
        {
            id:'4.1',
            section: 'OOP',
            title: 'Working with Objects',
            level: 'Intermidiate',
            importance: 'Must Read',
            links: ['https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Working_with_Objects'],
            description: 'Very useful introduction to objects in JS',
            notes: "Don't forget to use a browser's JS console to practice creating and modifying objects, and try all the codes yourself while reading the article."
        },
        {
            id:'4.2',
            section: 'OOP',
            title: 'Simple JavaScript Inheritance',
            level: 'Intermediate +',
            importance: 'Must Read',
            links: ['http://ejohn.org/blog/simple-javascript-inheritance/'],
            description: 'One of the best techniques to have class-based OOP behavior in JS',
            notes: "Its OK if you don't understand the implementation code (second code block in the article), the important thing is to be able to use this class defining approach (Class.extend/etc.) in your code, as well as a general understanding of what the implementation code is trying to solve."
        }
//        {
//            id:'4.2',
//            section: 'OOP',
//            title: '',
//            level: '',
//            importance: '',
//            links: [''],
//            description: '',
//            notes: ""
//        }
    ]
};

_.templateSettings = {interpolate : /\{\{(.+?)\}\}/g};
var createRow = _.template('<tr><td>{{id}}</td><td>{{section}}</td><td>{{title}}</td><td>{{level}}</td><td>{{importance}}</td><td>{{linkHtml}}</td></tr>');
var createLink = _.template('<a href="{{href}}" target="_blank">{{title}}</a>');
$(function(){
    var i, j, rs, r, lang;
    for (lang in resources) {
        if (!resources.hasOwnProperty(lang)) continue;
        rs = resources[lang];
        for (i=0; i<rs.length; i++) {
            r = rs[i];
            r.linkHtml = '';
            for (j=0; j< r.links.length; j++) {
                r.linkHtml += createLink({href: r.links[j], title: '<span class="glyphicon glyphicon-link"></span>'});
            }
            $('#' + lang + '-resources').append(createRow(r));
        }
    }
});
