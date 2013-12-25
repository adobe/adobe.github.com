calc("sec", getSec);
calc("min", getMin);
var intSec = setInterval('calc("sec", getSec)', 1000);
var intMin;

function calc(type, func) {
    $('.counter.'+type+' .to')
        .addClass('hide')
        .removeClass('to')
        .addClass('from')
        .removeClass('hide')
        .addClass('n')
        .find('span:not(.shadow)').each(function (i, el) {
			$(el).text(func(true));
		});
    $('.counter.'+type+' .from:not(.n)')
        .addClass('hide')
        .addClass('to')
        .removeClass('from')
        .removeClass('hide')
		.find('span:not(.shadow)').each(function (i, el) {
			$(el).text(func(false));
		});
    $('.counter.'+type+' .n').removeClass('n');
}


function getSec(next) {
    var d = new Date();
    var sec = 60-d.getSeconds();
	
    if (next) {
        sec--;
        if (sec < 0) {
            sec = 59;
        }
    } else if(sec == 60) {
        sec = 0;
		if (intMin == undefined) {
			calc("min", getMin);
			intMin = setInterval('calc("min", getMin)', 60000);
		}
    }
	
    return (sec < 10 ? '0' + sec : sec);
}

function getMin(next) {
    var d = new Date();
    var min = 60-d.getMinutes();
    if (next) {
        min--;
        if (min < 0) {
            min = 59;
        }
    } else if(min == 60) {
        min = 0;
//				calcMin();
    }
	
    return (min < 10 ? '0' + min : min);
}