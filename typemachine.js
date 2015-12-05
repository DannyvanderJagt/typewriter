var $input = document.getElementById('input');
var $output = document.getElementById('output');
var $export = document.getElementById('export');
var $animation = document.getElementById('animation');
var $result = document.getElementById('result');
var $play = document.getElementById('play');

var TypeMachine = {
	text: '',
	animating: false,
	spaces: [],

	lastTime: undefined,
	times: [],
	count: 0,
	total: 0,

	initialize(){
		$input.value = this.text;
		this.render();
	},

	onUpdate(e){
		this.text = $input.value;
		this.render();
	},

	onInput(e){
		this.stopAnimation();
		this.text = $input.value;

		var now = Date.now();
		var data;
		var char = this.text[this.text.length-1];//String.fromCharCode(e.charCode);

		if(this.lastTime === undefined){
			time = 0;
		}else{
			time = now - this.lastTime;
		}

		this.total += time;
		data = {time, char};

		this.times.push(data);

		this.lastTime = now;


		console.log('Total: ', this.total - time, 'Delay: ', time);
		this.spaces[this.spaces.length-1] = {
			time: Math.round((this.total - time)/100)/10,
			delay: Math.round(time / 100)/10
		};

		if(char === ' '){
			this.total = 0;
		}

		console.log(this.spaces);

		// this.render();
	},

	export(){
		$result.style.opacity = 1;
		$result.innerHTML = JSON.stringify(this.spaces);
	},

	toggleAnimation(){
		if(this.animating){
			this.stopAnimation();
		}else{
			this.startAnimation();
		}
	},

	startAnimation(){
		$play.src = 'pause.svg';
		this.animating = true;

		$animation.innerHTML = '';
		this.playStep(0);
	},

	playStep(step){
		if(step > this.spaces.length-1){
			this.stopAnimation();
			return;
		}

		var data = this.spaces[step];
		var time = data.time / data.text.length * 1000;
		var x = 0;
		var text = '';

			var interval = setInterval(function(){
				$animation.innerHTML += data.text[x];

				if(x === data.text.length-1){
					clearInterval(interval);
					$animation.innerHTML += ' ';
					setTimeout( function(){
						this.playStep(step + 1);
					}.bind(this), data.delay*1000);
				}else{
					x++;
				}

			}.bind(this), time);
	},

	stopAnimation(){
		$play.src = 'play.svg';
		this.animating = false;
	},

	render(){
		// Detect spaces.
		var text = this.text;
		this.spaces = this.detectSpaces(text);

		// Convert spaces to html.
		var html = this.spacesToHtml(this.spaces);

		$output.innerHTML = html;

		// Increase.
		var $increase = document.getElementsByClassName('increase');
		for(var i = 0; i < $increase.length; i++){
			$increase[i].addEventListener('click', this.onTimeIncrease.bind(this)); 
		}
		
		// Decrease.
		var $decrease = document.getElementsByClassName('decrease');
		for(var i = 0; i < $decrease.length; i++){
			$decrease[i].addEventListener('click', this.onTimeDecrease.bind(this)); 
		}
	},

	onTimeIncrease(e){
		console.log(e);
		var element = e.srcElement;
		var pos = +element.dataset.pos;
		var type = element.dataset.type;
		var value = +element.dataset.value;

		if(type === 'text'){
			value = Math.round((value + 0.1) * 10) / 10;
			if(value < 0){ value = 0; }
			this.spaces[pos].time = value;
		}else if (type === 'space'){
			value = Math.round((value + 0.05) * 100) / 100;
			if(value < 0){ value = 0; }
			this.spaces[pos].delay = value;
		}

		this.render();
	},

	onTimeDecrease(e){
		var element = e.srcElement;
		var pos = +element.dataset.pos;
		var type = element.dataset.type;
		var value = +element.dataset.value;

		if(type === 'text'){
			value = Math.round((value - 0.1) * 10) / 10;
			if(value < 0){ value = 0; }
			this.spaces[pos].time = value;
		}else if (type === 'space'){
			value = Math.round((value - 0.05) * 100) / 100;
			if(value < 0){ value = 0; }
			this.spaces[pos].delay = value;
		}

		this.render();
	},

	detectSpaces: function(text){
		var parts = text.match(/([^\s][\s]*?){1,}/g);

		if(!parts){ parts = []; }

		var spaces = parts.map((part, pos) => {
			return {
				text: part,
				time:  this.spaces[pos]  ? this.spaces[pos].time : Math.round((part.length * 0.1) * 10) / 10,
				delay: this.spaces[pos]  ? this.spaces[pos].delay : 0.15
			}
		});

		return spaces;
	},

	spacesToHtml(spaces){
		var data;
		return spaces.map((space, pos) => {
			data = (
				"<div class='text'>" + 
					space.text + 
					"<div class='ruler'>" + 
						"<div class='time'>" + 
							"<img src='increase.svg' class='increase' data-type='text' data-pos="+pos+" data-value="+space.time+" />" +
							space.time + "s" + 
							"<img src='decrease.svg' class='decrease' data-type='text' data-pos="+pos+" data-value="+space.time+" />" +
						"</div>" +
					"</div>" + 
				"</div>"
			);
			


			if(pos !== spaces.length-1){
				data += (
					"<div class='space' data-space='"+pos+"'>" +
						"<div class='time'>"+
							"<img src='increase.svg' class='increase' data-type='space' data-pos="+pos+" data-value="+space.delay+" />" +
							space.delay+"s" + 
							"<img src='decrease.svg' class='decrease' data-type='space' data-pos="+pos+" data-value="+space.delay+" />" +
						"</div>"+
						"<div class='ruler'></div>"+
						"<div class='dot'></div>" + 
					"</div>"
				);
			}

			return data;
		}).join('');
	}

};

// Listen for input.
$input.addEventListener('keyup', TypeMachine.onUpdate.bind(TypeMachine));
$input.addEventListener('keypress', TypeMachine.onInput.bind(TypeMachine));
$export.addEventListener('click', TypeMachine.export.bind(TypeMachine));
$play.addEventListener('click', TypeMachine.toggleAnimation.bind(TypeMachine));

TypeMachine.initialize();