const db = require("../models");
const User = db.user;
const Answer = db.answer;

const crypto = require('crypto');

exports.register = async (req, res) => {
    const user = req.body;

    const existingUsers = await User.find({ email: user.email });

    if(existingUsers.length == 0){
        const answers = [];

        for(let i = 0; i < user.answers.length; i++){
            answers.push(JSON.stringify(user.answers[i]));
        }

        const salt = crypto.randomBytes(16).toString('hex');
        const hashedPassword = crypto.pbkdf2Sync(user.password, salt, 1000, 64, `sha512`).toString(`hex`);

        const newUser = new User({
            username: user.username,
            email: user.email,
            password: hashedPassword,
            salt: salt,
            profileTags: [],
            questionTags: user.questionTags,
            answeredQuestions: user.answeredQuestions,
            answers: answers 
        });

        newUser.save().then(data => {
            const userID = data._id.toString();
            const username = data.username;
            const email = data.email;

            res.status(201).send({
                userID: userID,
                username: username,
                email: email
            });
        }).catch(error => {
            console.error(error);
            res.status(400).send({
                message: "Unable to save user."
            });
        });
    }
    else
    {
        res.status(400).send({
            message: "A user with this email already exists!"
        });
    }
};

exports.login = (req, res) => {
    // TODO: Implement me
    const email = req.body.email;
    const password = req.body.password;

    User.findOne({ email: email }).then(user => {
        const salt = user.salt;
        const hashedPassword = crypto.pbkdf2Sync(password, salt, 1000, 64, `sha512`).toString(`hex`);

        // TODO: Compare encrypted passwords
        if(hashedPassword == user.password)
        {
            // TODO: Don't send the entire user, only send some data
            res.status(200).send(user);
        }
        else
        {
            res.status(400).send({
                message: "Incorrect password"
            });
        }
    }).catch(error => {
        console.error(error);
        res.status(400).send({
            message: "This user does not exist!"
        });
    });
};

exports.getUser = (req, res) => {
    const userID = req.params.id;

    User.findOne({ _id: userID }).then(user => {
        // TODO: Don't send the entire user, only send some data
        res.status(200).send(user);
    });
    // TODO: Error handling
};

exports.deleteUser = (req, res) => {
    const userID = req.params.id;

    User.deleteOne({ _id: userID }).then(() => {
        res.status(200).send("User Deleted");
    });
    // TODO: Error handling
};

exports.getUserQuestionTags = (req, res) => {
    const userID = req.params.id;

    User.findOne({ _id: userID }).then(user => {
        res.status(200).send({
            questionTags: user.questionTags
        });
    });
    // TODO: Error handling
};

exports.getAnsweredQuestions = (req, res) => {
    const userID = req.params.id;

    if(userID != "New User"){
        User.findOne({ _id: userID }).then(user => {
            res.status(200).send({
                answeredQuestions: user.answeredQuestions
            });
        });
        // TODO: Error handling
    }
    else{
        res.status(200).send({answeredQuestions: []});
    }
};

exports.submitSelectAnswer = async (req, res) => {
    const userID = req.body.userID;
    const questionID = req.body.questionID;
    const answerIDs = req.body.answerIDs;

    const newAnswer = {
        questionID: questionID,
        answerIDs: answerIDs
    };

    // TODO: Make sure I work
    await submitAnswer(userID, questionID, newAnswer).then(result => {
        res.status(result.status).send(result.message);
    });
    // TODO: Error handling
};

exports.submitSliderAnswer = async (req, res) => {
    const userID = req.body.userID;
    const questionID = req.body.questionID;
    const sliderValue = req.body.value;
    const answerTag = req.body.tag;

    const newAnswer = {
        questionID: questionID,
        sliderValue: sliderValue,
        answerTag: answerTag
    };

    // TODO: Make sure I work
    await submitAnswer(userID, questionID, newAnswer).then(result => {
        res.status(result.status).send(result.message);
    });
    // TODO: Error handling
};

exports.submitTextAnswer = async (req, res) => {
    const userID = req.body.userID;
    const questionID = req.body.questionID;
    const answers = req.body.newAnswers;

    const newAnswer = {
        questionID: questionID,
        newAnswers: answers
    };

    // TODO: Add question tags or something else based on these recipes

    await submitAnswer(userID, questionID, newAnswer).then(result => {
        res.status(result.status).send(result.message);
    });
    // TODO: Error handling
};

exports.addQuestionTag = (req, res) => {
    // TODO: Implement me
    const userID = req.body.userID;
    const tags = req.body.tags;

    const result = addQuestionTag(userID, tags);

    res.status(result.status).send(result.message);
};

const addQuestionTag = (userID, tags) => {
    User.findOne({ _id: userID }).then(user => {
        const updatedQuestionTags = user.questionTags;

        tags.forEach(tag => {
            if(!updatedQuestionTags.includes(tag)){
                updatedQuestionTags.push(tag);
            }
        });

        user.questionTags = updatedQuestionTags;
        user.save().then(() => {
            return {
                status: 200,
                message: "Question Tags Saved"
            };
        });
        // TODO: Error handling
    });
    // TODO: Error handling
}

// TODO: Turn me into a promise
const submitAnswer = (userID, questionID, newAnswer) => {
    return new Promise((resolve, reject) => {
        User.findOne({ _id: userID }).then(user => {
            const answeredQuestions = user.answeredQuestions;
            let answers = user.answers;

            let markedAnswer = null;
            answers.forEach(answer => {
                if(JSON.parse(answer).questionID == questionID)
                    markedAnswer = answer;
            });

            if(markedAnswer){
                answers = answers.filter(answer => {
                    return answer != markedAnswer;
                });
            }
            else{
                answeredQuestions.push(questionID);
            }

            answers.push(JSON.stringify(newAnswer));

            if(newAnswer.answerIDs){
                const answerIDs = newAnswer.answerIDs;
                answerIDs.forEach(answerID => {
                    Answer.findOne({ _id: answerID }).then(rawAnswer => {
                        // TODO: Handle the result and catch errors as necessary
                        const result = addQuestionTag(userID, rawAnswer.tags);
                    });
                });
            }
            else if(newAnswer.answerTag){
                // TODO: Handle the result and catch errors as necessary
                const result = addQuestionTag(userID, [newAnswer.answerTag]);
            }

            user.answeredQuestions = answeredQuestions;
            user.answers = answers;
            user.save().then(() => {
                resolve({
                    status: 200,
                    message: "Answers Saved"
                });
            });
            // TODO: Error handling
        });
        // TODO: Error handling
    });
}