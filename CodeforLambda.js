'use strict';
const Alexa = require('alexa-sdk');
const APP_ID = undefined;


/***********
Data: Customize the data below as you please.
***********/


const SKILL_NAME = "Personality Quiz";
const HELP_MESSAGE_BEFORE_START = "By answering six, simple questions, I will tell you what US city matches your personality. Are you ready to play?";
const HELP_MESSAGE_AFTER_START = "Please respond with yes or no and I'll give you the US city that matches your personality.";
const HELP_REPROMPT = "Your matched city will be given to you after you answer all of my yes or no questions.";
const STOP_MESSAGE = "Your perfect city will be waiting for you next time.";
const CANCEL_MESSAGE = "Let's start over.";
const MISUNDERSTOOD_INSTRUCTIONS_ANSWER = "Sorry, please answer with either yes or no.";


const WELCOME_MESSAGE = "Hi there! Ever wondered what city you belong in or what city suits your style? I can tell you! Just answer six questions about your personality with either yes or no and you'll be matched! Are you ready to start?";
const INITIAL_QUESTION_INTROS = [
    "Perfect!",
    "<say-as interpret-as='interjection'>Alright</say-as>! Here comes your first question!",
    "Ok let's go. <say-as interpret-as='interjection'>Ahem</say-as>.",
    "<say-as interpret-as='interjection'>well well</say-as>."
];
const QUESTION_INTROS = [
    "Sounds about right.",
    "I couldn't agree more",
    "That's what I would have chose",
    "Cool choice.",
    "Totally agree.",
    "Of course.",
    "I knew it.",
    "So true.",
    "You're not wrong."
];
const UNDECISIVE_RESPONSES = [
    "<say-as interpret-as='interjection'>Honk</say-as>. I'll just choose for you.",
    "<say-as interpret-as='interjection'>Nanu Nanu</say-as>. I picked an answer for you.",
    "<say-as interpret-as='interjection'>Uh oh</say-as>... well nothing I can do about that.",
    "<say-as interpret-as='interjection'>Aha</say-as>. We will just move on then.",
    "<say-as interpret-as='interjection'>Aw man</say-as>. How about this question?",
];
const RESULT_MESSAGE = "Your ideal city is "; // the name of the result is inserted here.
const PLAY_AGAIN_REQUEST = "Fun, right? Do you want to play again?";


const animalList = {
    losangeles: {
        name: "Los Angeles, California",
        display_name: "Los Angeles, California",
        audio_message: "You're calm and laid back just like the vibe in Los Angeles, California",
        description: "You're calm and laid back just like the vibe in Los Angeles, California. Your positive bright nature matches that of the the sun and beach. You love to eat health and stay fit. You work hard but also know it's important to rest and recharge.",
        img: {
            smallImageUrl: "https://www.flickr.com/photos/35929830@N05/10519692053/",
            largeImageUrl: "https://www.flickr.com/photos/35929830@N05/10519692053/"
        }
    },
    newyorkcity: {
        name: "New York City",
        display_name: "New York City",
        audio_message: "You are a busy bee like everyone in the city that never sleeps! New York City!",
        description: "You are a busy bee like everyone in the city that never sleeps! New York City! You talk fast, you work hard, and you love bagels and pizzas! You know that being late is not an option and you are always 5 minutes early to everything.",
        img: {
            smallImageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSgLwdgGPBJe95KgobIUHEuHB2YrYjF3qxpBva9CpRvy8Jwf5xP",
            largeImageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSgLwdgGPBJe95KgobIUHEuHB2YrYjF3qxpBva9CpRvy8Jwf5xP"
        }
    },


    miami: {
        name: "Miami, Florida",
        display_name: "Miami, Florida",
        audio_message: "You want to keep it spicy like they do in Miami, Florida.",
        description: "You want to keep it spicy like they do in Miami, Florida. You like to relax, have fun, and have a good time! You don't stress too much about work and live it up.  You enjoy that beach life and experiencing culture.",
        img: {
            smallImageUrl: "https://www.perfectstayz.com/blogs/wp-content/uploads/2018/04/miami-vacation-pictures.jpg",
            largeImageUrl: "https://www.perfectstayz.com/blogs/wp-content/uploads/2018/04/miami-vacation-pictures.jpg"
        }
    }
};


const questions = [{
        question: "Do you enjoy things with spice?",
        points: {
            losangeles: 2,
            newyorkcity: 1,
            miami: 3
        }
    },
    {
        question: "Do you lead a hectic life?",
        points: {
            losangeles: 2,
            newyorkcity: 3,
            miami: 1
        }
    },
    {
        question: "Do you like the beach?",
        points: {
            losangeles: 3,
            newyorkcity: 1,
            miami: 2
        }
    },
    {
        question: "Do you like to workout and stay fit?",
        points: {
            losangeles: 2,
            newyorkcity: 1,
            miami: 3
        }
    },
    {
        question: "Do you drink tea?",
        points: {
            losangeles: 2,
            newyorkcity: 1,
            miami: 3
        }
    },
    {
        question: "Do you drink coffee?",
        points: {
            losangeles: 2,
            newyorkcity: 3,
            miami: 1
        }
    }
];


/***********
Execution Code: Avoid editing the code below if you don't know JavaScript.
***********/


// Private methods (this is the actual code logic behind the app)


const _initializeApp = handler => {
    // Set the progress to -1 one in the beginning
    handler.attributes['questionProgress'] = -1;
    // Assign 0 points to each animal
    var initialPoints = {};
    Object.keys(animalList).forEach(animal => initialPoints[animal] = 0);
    handler.attributes['animalPoints'] = initialPoints;
};


const _nextQuestionOrResult = (handler, prependMessage = '') => {
    if (handler.attributes['questionProgress'] >= (questions.length - 1)) {
        handler.handler.state = states.RESULTMODE;
        handler.emitWithState('ResultIntent', prependMessage);
    } else {
        handler.emitWithState('NextQuestionIntent', prependMessage);
    }
};


const _applyAnimalPoints = (handler, calculate) => {
    const currentPoints = handler.attributes['animalPoints'];
    const pointsToAdd = questions[handler.attributes['questionProgress']].points;


    handler.attributes['animalPoints'] = Object.keys(currentPoints).reduce((newPoints, animal) => {
        newPoints[animal] = calculate(currentPoints[animal], pointsToAdd[animal]);
        return newPoints;
    }, currentPoints);
};


const _randomQuestionIntro = handler => {
    if (handler.attributes['questionProgress'] == 0) {
        // return random initial question intro if it's the first question:
        return _randomOfArray(INITIAL_QUESTION_INTROS);
    } else {
        // Assign all question intros to remainingQuestionIntros on the first execution:
        var remainingQuestionIntros = remainingQuestionIntros || QUESTION_INTROS;
        // randomQuestion will return 0 if the remainingQuestionIntros are empty:
        let randomQuestion = remainingQuestionIntros.splice(_randomIndexOfArray(remainingQuestionIntros), 1);
        // Remove random Question from rameining question intros and return the removed question. If the remainingQuestions are empty return the first question:
        return randomQuestion ? randomQuestion : QUESTION_INTROS[0];
    }
};


const _randomIndexOfArray = (array) => Math.floor(Math.random() * array.length);
const _randomOfArray = (array) => array[_randomIndexOfArray(array)];
const _adder = (a, b) => a + b;
const _subtracter = (a, b) => a - b;


// Handle user input and intents:


const states = {
    QUIZMODE: "_QUIZMODE",
    RESULTMODE: "_RESULTMODE"
}


const newSessionHandlers = {
    'NewSession': function() {
        _initializeApp(this);
        this.emit(':askWithCard', WELCOME_MESSAGE, SKILL_NAME, WELCOME_MESSAGE);
        //                         ^speechOutput,   ^cardTitle, ^cardContent,   ^imageObj
    },
    'YesIntent': function() {
        this.handler.state = states.QUIZMODE;
        _nextQuestionOrResult(this);
    },
    'NoIntent': function() {
        this.emitWithState('AMAZON.StopIntent');
    },
    'AMAZON.HelpIntent': function() {
        this.emit(':askWithCard', HELP_MESSAGE_BEFORE_START, HELP_REPROMPT, SKILL_NAME);
    },
    'AMAZON.CancelIntent': function() {
        this.emitWithState('AMAZON.StopIntent');
    },
    'AMAZON.StopIntent': function() {
        this.emit(':tellWithCard', STOP_MESSAGE, SKILL_NAME, STOP_MESSAGE);
    },
    'Unhandled': function() {
        this.emit(':ask', MISUNDERSTOOD_INSTRUCTIONS_ANSWER);
    }
};




const quizModeHandlers = Alexa.CreateStateHandler(states.QUIZMODE, {
    'NextQuestionIntent': function(prependMessage = '') {
        // Increase the progress of asked questions by one:
        this.attributes['questionProgress']++;
        // Reference current question to read:
        var currentQuestion = questions[this.attributes['questionProgress']].question;


        this.emit(':askWithCard', `${prependMessage} ${_randomQuestionIntro(this)} ${currentQuestion}`, HELP_MESSAGE_AFTER_START, SKILL_NAME, currentQuestion);
        //                        ^speechOutput                                                         ^repromptSpeech           ^cardTitle  ^cardContent     ^imageObj
    },
    'YesIntent': function() {
        _applyAnimalPoints(this, _adder);
        // Ask next question or return results when answering the last question:
        _nextQuestionOrResult(this);
    },
    'NoIntent': function() {
        // User is responding to a given question
        _applyAnimalPoints(this, _subtracter);
        _nextQuestionOrResult(this);
    },
    'UndecisiveIntent': function() {
        // Randomly apply
        Math.round(Math.random()) ? _applyAnimalPoints(this, _adder) : _applyAnimalPoints(this, _subtracter);
        _nextQuestionOrResult(this, _randomOfArray(UNDECISIVE_RESPONSES));
    },
    'AMAZON.RepeatIntent': function() {
        var currentQuestion = questions[this.attributes['questionProgress']].question;


        this.emit(':askWithCard', currentQuestion, HELP_MESSAGE_AFTER_START, SKILL_NAME, currentQuestion);
        //                        ^speechOutput    ^repromptSpeech           ^cardTitle ^cardContent     ^imageObj
    },
    'AMAZON.HelpIntent': function() {
        this.emit(':askWithCard', HELP_MESSAGE_AFTER_START, HELP_REPROMPT, SKILL_NAME);
    },
    'AMAZON.CancelIntent': function() {
        this.emit(':tellWithCard', CANCEL_MESSAGE, SKILL_NAME, CANCEL_MESSAGE);
    },
    'AMAZON.StopIntent': function() {
        this.emit(':tellWithCard', STOP_MESSAGE, SKILL_NAME, STOP_MESSAGE);
    },
    'Unhandled': function() {
        this.emit(':ask', MISUNDERSTOOD_INSTRUCTIONS_ANSWER);
    }
});




const resultModeHandlers = Alexa.CreateStateHandler(states.RESULTMODE, {
    'ResultIntent': function(prependMessage = '') {
        // Determine the highest value:
        const animalPoints = this.attributes['animalPoints'];
        const result = Object.keys(animalPoints).reduce((o, i) => animalPoints[o] > animalPoints[i] ? o : i);
        const resultMessage = `${prependMessage} ${RESULT_MESSAGE} ${animalList[result].name}. ${animalList[result].audio_message}. ${PLAY_AGAIN_REQUEST}`;


        this.emit(':askWithCard', resultMessage, PLAY_AGAIN_REQUEST, animalList[result].display_name, animalList[result].description, animalList[result].img);
        //                        ^speechOutput  ^repromptSpeech     ^cardTitle                       ^cardContent                    ^imageObj
    },
    'YesIntent': function() {
        _initializeApp(this);
        this.handler.state = states.QUIZMODE;
        _nextQuestionOrResult(this);
    },
    'NoIntent': function() {
        this.emitWithState('AMAZON.StopIntent');
    },
    'AMAZON.HelpIntent': function() {
        this.emit(':askWithCard', HELP_MESSAGE_AFTER_START, HELP_REPROMPT, SKILL_NAME);
    },
    'AMAZON.CancelIntent': function() {
        this.emitWithState('AMAZON.StopIntent');
    },
    'AMAZON.StopIntent': function() {
        this.emit(':tellWithCard', STOP_MESSAGE, SKILL_NAME, STOP_MESSAGE);
    },
    'Unhandled': function() {
        this.emit(':ask', MISUNDERSTOOD_INSTRUCTIONS_ANSWER);
    }
});






exports.handler = (event, context, callback) => {
    const alexa = Alexa.handler(event, context);
    alexa.APP_ID = APP_ID;
    alexa.registerHandlers(newSessionHandlers, quizModeHandlers, resultModeHandlers);
    alexa.execute();
};
