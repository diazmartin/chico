/**
 *	Validator
 *	@author 
 *	@Contructor
 *	@return An interface object
 */

ui.validator = function(conf){
	var that = ui.object(); // Inheritance
	var validation = true;
	var watchers = [];

	// Watcher constructor
	var Watcher = function(wconf){

		// Checkbox and radio button special config
		if(wconf.$element.hasClass('options')){
			wconf.tag = 'OPTIONS';
			if(wconf.$element.hasClass('required')) wconf.$element = ( // Required trigger (h4 or legend or element -helper will be fire from here-)
				( (wconf.$element.find('h4').length > 0) ? wconf.$element.find('h4') : false ) || // if exists H4, get H4
				( (wconf.$element.prev().attr('tagName') == 'LEGEND') ? wconf.$element.prev() : false ) || // if previous element is a legend tag, get previous element
				wconf.$element // element
			);
		
			// TODO: en el blur de los options tienen que validar que este ok
		
		// Input, select, textarea
		}else{
		//	console.log("Binding blur eventos to "+wconf.tagName);
			wconf.$element.bind('blur', function(event){
				wconf.event = event;
				watchers[wconf.id].status = validate(wconf);
			});
		};
	//	console.log("Creating Watcher");
		return { status: true, helper: ui.helper( wconf ) };
	};
	
	// Validate
	var validations = function(method, wconf){
		var value = wconf.$element.val();
		
		switch(method){
			case 'text':		return value.match(/^([a-zA-Z\s]+)$/m); break;
			case 'number':		return !isNaN(value);/*value.match(/^\d+$/m);*/ break;
			case 'email':		return value.match(/^([\w]+)(.[\w]+)*@([\w]+)(.[\w]{2,3}){1,2}$/); break;
			case 'url':			return value.match(/^(http:\/\/www.|https:\/\/www.|ftp:\/\/www.|www.){1}([\w]+)(.[\w]+){1,2}$/); break;
			case 'range':		return validations('number', wconf) && validations('min', wconf) && validations('max', wconf); break;
			case 'required':	return (wconf.tag == 'SELECT') ? value != -1 : $.trim(value).length > 0; break; // Select vs. input, options, textarea
			case 'min':			return value >= parseInt(wconf.$element.attr('min')); break;
			case 'max':			return value <= parseInt(wconf.$element.attr('max')); break;
			case 'minLength':	return value.length >= parseInt(wconf.messages.minLength[0]); break;
			case 'maxLength':	return value.length <= parseInt(wconf.messages.maxLength[0]); break;
		};
	};
	
	var validate = function(wconf){ // TODO: onBlur, si sigue con error tiene que validar otra vez
		var helper = watchers[wconf.id].helper;
//		console.log("Starting Validate function");
		// Each validation
		for(var x in wconf.messages){
			// Don't validate disabled elements
			if(wconf.$element.parents('label').hasClass('disabled') && wconf.$element.attr('disabled')) break;
			
			// Don't validate not required elements (Si no es obligatorio y el campo esta vacio, esta todo ok)
			if(!wconf.$element.parents('label').hasClass('required') && !validations('required', wconf)) break;
			
			// Status error (cut the flow)
			if(!validations(x, wconf)){
				// Executed on Blur
				if(wconf.event.type == 'blur') return false;
				
				// Executed on Submit
				wconf.$element.addClass('error');
				if($('.helper' + wconf.id)) helper.hide(); // TODO: refactor del hide del helper
				// Show helper (min/maxLength message vs. normal message)
				if(x == 'minLength' || x == 'maxLength') helper.show(wconf.messages[x][1]); else helper.show(wconf.messages[x]);
				return false;
			};
		};
		
		// Status ok
		// With previous error...
		if(wconf.$element.hasClass('error')){ helper.hide(); wconf.$element.removeClass('error'); };
		
		// Executed on Submit
		if(wconf.event.type === 'submit') return true;
		
		// Executed on Blur (General error checker)
		validation = true; // Reset general status
		$.each(watchers, function(i, e){ if(i != wconf.id && !e.status) validation = false }); // Check each watcher status except current watcher, because this time it's true
		if(validation) removeValidation(); // Remove top helper if no errors
		return true;
	};
	
	// Remove big helper
	var removeValidation = function(){
		$('.uiValidator').fadeOut('fast', function(){ $(this).remove(); });
	};

	//console.log("Before bind events");
	// Form events
	$(conf.element).find('input[type=submit]').unbind('click'); // Delete all click handlers asociated to submit button
	$(conf.element).bind('submit', function(event){
		that.prevent(event);
		
		// Reset form status
		if(!validation){ removeValidation(); validation = true; };
		
		// Validate each field
		var index = 0;
		for(var x in conf.fields){
			var helper = watchers[index].helper;
			
			// Input, select, textarea
			if(!$(x).hasClass('options')){
				// Watcher configuration
				var wconf = {
					id: index,
					$element: $(x),
					tag: $(x).attr('tagName'),
					messages: conf.fields[x],
					event: event
				};
				
				// Error
				if(!validate(wconf)){					
					watchers[index].status = false;
					validation = false;
				// Ok (clean field error)
				}else{
					$(x).removeClass('error');
					helper.hide();
				};
			
			// Checkbox, Radio button (Options)
			}else{
				// Error
				if($(x).find('input:checked').length === 0){
					if($('.helper' + index)) helper.hide(); // TODO: refactor del hide del helper
					helper.show(conf.fields[x]['required']);
					watchers[index].status = false;
					validation = false;
				// Ok (clean field error)
				}else{
					helper.hide();
				};
			};
			
			// Increase index
			index ++;
		};
		
		// General error
		if(!validation){
			$(conf.element).before('<p class="uiValidator"><span class="ico error">Error: </span>' + conf.defaults.error + '</p>');
		// General ok
		}else{
			removeValidation();
			// Callback vs. submit
			if(conf.callbacks && conf.callbacks.submit) conf.callbacks.submit(); else conf.element.submit();
		};
	});

	
	// Create each Watcher
	for(var x in conf.fields){
		var wconf = {
			id: watchers.length, // because length is: 0, 1, 2, 3...
			$element: $(x),
			tag: $(x).attr('tagName'), // INPUT, SELECT, TEXTAREA, OPTIONS
			messages: conf.fields[x]
		};
	//	console.log(wconf);
		watchers.push( Watcher( wconf ) );
	};
	
//	console.log(watchers);
	
	// 5. Public members
	return { watchers: watchers };
};


/**
 *	Helper
 *	@author
 *	@Contructor
 *	@return An interface object
 */

ui.helper = function(wconf){
	var that = ui.floats(); // Inheritance

	// Global configuration
	var conf = {
		name: 'helper',
        $trigger: wconf.$element,
		align: 'right',
		cone: true,
		content: { type: 'param' },
		classes: 'helper' + wconf.id,
		wrappeable: true,
		status: false
	};
	
	var hide = function(){
//		$('.helper' + wconf.id).fadeOut('fast', function(){ $(this).remove() }); // TODO: refactor del hide (ocultar solamente el que esta activo)
		wconf.$element.removeClass('uiTrigger');
		$('.helper' + wconf.id).unwrap().remove();
		that.callbacks(conf, 'hide');
	};
	
	var show = function(text){
		conf.content.data = '<span class="ico error">Error: </span>' + text;		
		that.show($.Event(), conf);
		if(ui.utils.html.hasClass('ie7')) $('.helper' + wconf.id).parent().css('display','inline');
	};

	//console.log("Creating Helper for "+wconf.tagName);

	return { show: function(text){ show(text) }, hide: hide };
};
