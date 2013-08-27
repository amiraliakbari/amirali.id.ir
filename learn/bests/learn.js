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
    ],
    web: [
        {
            id:'6.1',
            section: 'Validation',
            title: 'Free email validation API for web forms',
            level: 'Intermediate',
            importance: 'Useful',
            links: ['http://blog.mailgun.com/post/free-email-validation-api-for-web-forms/'],
            description: 'A free web service to precisely validating emails',
            notes: "Read it to realize why you can't do it yourself!"
        }
    ],
    cs: [
        {
            id:'1.1',
            section: 'Algorithms',
            title: 'Big-O notation explained...',
            level: 'Elementary',
            importance: 'Must Read',
            links: ['http://justin.abrah.ms/computer-science/big-o-notation-explained.html'],
            description: '',
            notes: ""
        },
        {
            id:'1.1',
            section: 'Algorithms',
            title: 'Big-O is easy to calculate, if you know how',
            level: 'Elementary',
            importance: 'Must Read',
            links: ['http://justin.abrah.ms/computer-science/how-to-calculate-big-o.html'],
            description: '',
            notes: ""
        }
    ],
    ruby: [
        {
            id: '1.1',
            section: 'Syntax',
            title: 'Rubby Warrior',
            level: 'Elementary +',
            importance: 'Interesting',
            links: ['https://www.bloc.io/ruby-warrior/'],
            description: 'Learn ruby programming while playing a turned-based game!',
            notes: ""
        }
    ]
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
};

var layoutData = {
    js: {
        name: 'JavaScript'
    },
    cs: {
        name: 'Computer Science'
    },
    web: {
        name: 'Web Programming'
    },
    ruby: {
        name: 'Ruby Language'
    }
};

_.templateSettings = {interpolate : /\{\{(.+?)\}\}/g};
var sectionT = _.template('<h2>{{title}}</h2><table class="table table-hover"><tr><th>ID</th><th>Section</th><th>Name</th><th>Level</th><th>Importance</th><th></th></tr><tbody id="{{id}}-resources"></tbody></table><br/>');
var createRow = _.template('<tr><td>{{id}}</td><td>{{section}}</td><td title="{{description}}">{{title}}</td><td>{{level}}</td><td>{{importance}}</td><td>{{linkHtml}}</td></tr>');
var createLink = _.template('<a href="{{href}}" target="_blank">{{title}}</a>');
$(function(){
    var i, j, rs, r, lang;
    for (lang in resources) {
        if (!resources.hasOwnProperty(lang)) continue;
        rs = resources[lang];
        if (resources[lang].length > 0) {
            $('#resources-container').append(sectionT({title: layoutData[lang].name, id: lang}));
        }
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
