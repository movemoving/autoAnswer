// ==UserScript==
// @name         中华会计网校继续教育自动答题
// @namespace    https://github.com/zztisoftwyj/autoAnswer
// @version      0.0.1
// @description  中华会计网校继续教育学习自动答题
// @author       zztisoftwyj
// @match        http://jxjy.chinaacc.com/courseware/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const answerRegex = /(?<=正确答案：)[\w对错]+(?=。)/;
    //额外的添加元素
    const answerFlagList = ['', '0'];
    const answerTipId = '#PointQuestionAnswer'
    const answerName = 'useranswer';


    const answerDict = {
        "对": "Y",
        "错": "N",
        "A": "A",
        "B": "B",
        "C": "C",
        "D": "D",
        "E": "E",
        "F": "F"
    };

    //获取页面的元素
    const getElementById = function (id) {
        return answerFlagList.map(item => document.querySelector(id + item))
    }

    const getElementByNameAndValue = function (name, value) {
        for (const item of answerFlagList) {
            const _node = document.querySelector("input[name='" + name + item + "'][value='" + value + "']")
            if (_node) {
                return _node
            }
        }
        return null
    }

    //获取文本信息
    const getInnerText = function (id) {
        const elementList = getElementById(id)
        for (const item of elementList) {
            if (item && item.innerText) {
                return item.innerText
            }
        }
        return null
    }

    //获取html信息
    //注意：此处如果展示的弹窗更改了位置，脚本就会失效
    const getInnerHtml = function (id) {
        const elementList = getElementById(id)
        for (const item of elementList) {
            if (item && item.innerHTML !== '') {
                return item.innerHTML
            }
        }
        return ''
    }

    const setInnerHtml = function (id, html) {
        const elementList = getElementById(id)
        for (const item of elementList) {
            if (item) {
                item.innerHTML = html
            }
        }
    }

    //答题主体
    const autoAnswer = function () {
        // console.log(new Date().getTime())
        //此处判断对于初次加载无效，所以还需要判断是否有提交按钮
        if (isTesting()) {
            // 先直接提交答案，以便得到正确答案
            const res = doAnswer();
            //判断提交按钮是否存在
            if (res) {
                console.log('获取到题目信息，准备获取答案。。。')
                const loadCorrectAnswerTimerId = setInterval(function () {
                    console.log('正在获取答案。。。')
                    if (getInnerHtml(answerTipId) !== "") {
                        clearInterval(loadCorrectAnswerTimerId);
                        // console.log('准备开始答题。。。')
                        let correctAnswer = getCorrectAnswer();
                        if (correctAnswer) {
                            fillRightAnswer(correctAnswer);
                            clearAnswerDiv();
                            doAnswer();
                            console.log('答题完成，继续听课中。。。');
                            setTimeout(autoAnswer, 1000 * 10);
                        }
                    }
                }, 1000)
            } else {
                // console.log('未获取到提交按钮，继续听课中。。。')
                setTimeout(autoAnswer, 1000 * 5);
            }
        } else {
            setTimeout(autoAnswer, 1000 * 5);
        }
    }

    // 检查是否在进行答题
    let isTesting = function () {
        // 答题弹窗
        const testDiv = document.querySelector("div#videoPoint");
        return "none" != testDiv.style.display;
    };

    // 提交答案
    let doAnswer = function () {
        // 答题按钮
        let answerBtn = document.querySelector("input[name='btn']");
        if (answerBtn) {
            answerBtn.click();
            return true
        }
        return false
    };

    //获取最新存储答案元素
    let findCurAnswer = function () {
        const answerText = getInnerText(answerTipId)
        if (answerText) {
            return answerText
        } else {
            console.error('获取正确答案失败')
            return null
        }
    }

    // 取得正确答案
    //现在该元素会有多个id序号递增的情况
    // PointQuestionAnswer1,PointQuestionAnswer2...
    let getCorrectAnswer = function () {
        let answerText = findCurAnswer()
        if (answerText) {
            let match = answerText.match(answerRegex);
            if (match) {
                return match[0];
            }
        }
        return null
    };

    // 选择正确答案
    let fillRightAnswer = function (answerString) {
        let answers = answerString.split("");
        for (let answer of answers) {
            let answerValue = answerDict[answer.toUpperCase()];
            const el = getElementByNameAndValue(answerName, answerValue)
            if (el) {
                el.checked = true
            }
        }
    };

    // 清空答案提示
    let clearAnswerDiv = function () {
        setInnerHtml(answerTipId, '')
    };
    setTimeout(function () {
        console.log('脚本开始执行')
        autoAnswer()
    }, 1000 * 2);
})();
