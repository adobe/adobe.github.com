var intSec;
var deadline = new Date(2014, 0, 15, 20, 00, 00, 00);

var calc = function(type, func) {
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


var getSec = function(next) {
    var today = new Date();
    var sec = secsUntil(today, deadline);
	
    if (!next) {
        sec++;
    }
	
	if (sec === 60) {
		sec = 0;
	}
	
    return (sec < 10 ? '0' + sec : sec);
}

var getMin = function(next) {
    var today = new Date();
    var min = minsUntil(today, deadline);
	
    if (!next) {
        min++;
    }
	
	if (min === 60) {
		min = 0;
	}
	
    return (min < 10 ? '0' + min : min);
}

var getHour = function(next) {
    var today = new Date();
    var hour = hoursUntil(today, deadline);
	
    if (!next) {
        hour++;
    }
	
	if (hour === 24) {
		hour = 0;
	} else if (hour === 25) {
		hour = 1;
	}
	
    return (hour < 10 ? '0' + hour : hour);
}

var getDay = function(next) {
    var today = new Date();
    var day = daysUntil(today, deadline);
	
    if (!next) {
        day++;
    }
	
	if (day < 0) {
		day = 0;
	}
	
    return (day < 10 ? '0' + day : day);
}

// Days until Date2 from Date1
var daysUntil = function(date1, date2) {
    // Convert both dates to milliseconds
    var msD1 = date1.getTime();
    var msD2 = date2.getTime();

    // Calculate the difference in milliseconds
    var msDiff = msD2 - msD1;

    // Convert back to days and return
    return (msDiff >= 0) ? Math.floor( msDiff / (24*3600*1000) ) : -1;
}
	
// Hours until Date2 from Date1
var hoursUntil = function(date1, date2) {
	var hDiff = 0;
	var daysLeft = daysUntil(date1, date2);
	
	if (daysLeft !== -1) {
		// Convert both dates to milliseconds
		var msD1 = date1.getTime();
		var msD2 = date2.getTime();
	
		// Calculate the difference in milliseconds
		hDiff = Math.floor( ( msD2 - msD1 ) / ( 3600*1000 ) ) - daysLeft * 24;
	}
	
	return hDiff;
}
	
// Minutes until Date2 from Date1
var minsUntil = function(date1, date2) {
	var mDiff = 0;
	var daysLeft = daysUntil(date1, date2);
	var hoursLeft = hoursUntil(date1, date2);
	
	if (daysLeft !== -1) {
		// Convert both dates to milliseconds
		var msD1 = date1.getTime();
		var msD2 = date2.getTime();
	
		mDiff = Math.floor( ( msD2 - msD1 ) / ( 60*1000 ) ) - daysLeft * 24*60 - hoursLeft * 60;
	}
	
	return mDiff;
}
	
// Seconds until Date2 from Date1
var secsUntil = function(date1, date2) {
	var sDiff = 0;
	var daysLeft = daysUntil(date1, date2);
	var hoursLeft = hoursUntil(date1, date2);
	var minsLeft = minsUntil(date1, date2);
	
	if (daysUntil(date1, date2) !== -1) {
		// Convert both dates to milliseconds
		var msD1 = date1.getTime();
		var msD2 = date2.getTime();
	
		sDiff = Math.floor( ( msD2 - msD1 ) / ( 1000 ) ) - daysLeft * 24*3600 - hoursLeft * 3600 - minsLeft * 60;
	}
	
	return sDiff;
}

calc("sec", getSec);
calc("min", getMin);
calc("hour", getHour);
calc("day", getDay);
var today = new Date();
if (daysUntil(today, deadline) !== -1) {
	intSec = setInterval(function() {
		calc("sec", getSec);
		
		var actSec = parseInt(getSec(false));
		if (actSec === 0) {
			calc("min", getMin);
			
			if (parseInt(getMin(false)) === 0) {
				calc("hour", getHour);
		
				if (parseInt(getHour(false)) === 0) {
					calc("day", getDay);
				}
			}
		} else if (
			(actSec === 1)
		 && (parseInt(getMin(false)) === 1)
		 && (parseInt(getHour(false)) === 1)
		 && (parseInt(getDay(false)) === 0)) {
			console.log("STOP!");
			clearInterval(intSec);
		}
	}, 1000);
}
console.log(daysUntil(today, deadline));
console.log(hoursUntil(today, deadline));
console.log(minsUntil(today, deadline));
console.log(secsUntil(today, deadline));