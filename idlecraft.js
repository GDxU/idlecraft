
	//create some global variables (should avoid that...)
	var savegame_JSON;
	var generate_profits 	= [];
	var prices   		  	= [];
	var prices_delta		= [];
	var prices_delta2   	= [];
	var durations 			= [];
	var durationremaining 	= [];
	var itemactivated 		= [];
	var managerhired 		= [];
	var balance 			;
	var durationbarlength ;
	
	
function Idlecraft() {

	

	// Settings
	this.setting_generate_multiplier 	= [ 1.06 , 60.0 , 540 ,  4320,        51840,       622080,       8709120,      139345920,      2508226560,      50164531200  ];
	this.setting_price_base 	 	 	= [ 4.00 , 60.0 , 720 ,  8640,        83680,      1044160,      10929920,      179159040,      4149000000,      65798000000  ];
	this.setting_price_delta 			= [ 0.28 , 9.00 , 115 ,  1440,        14183,       180027,       1917529,       31992685,       754363636,      12184814814  ]; 
	this.setting_price_delta2  			= [ 0.02 , 1.35 , 18.3,   240,         2403,        31039,        336408,        5712979,       137157024,       2256447187  ];
	this.setting_price_delta3 			= [ 0.02 , 0.04 , 0.08,  0.16,         0.32,         0.64,          1.28,           2.56,            5.12,            10.24  ];
	this.setting_duration      			= [  500 , 2500 , 5000,   11000,      23000,        47000,         95000,         191000,          383000,           767000  ];
	this.setting_managerprice 			= [ 1000, 15000, 100000, 500000,    4200000,     40000000,     870000000,    14000000000,    280000000000,    7000000000000  ];
	this.timerinterval 		= 20;
	

	// Variables
	this.generate_profits 	= [];
	prices   		  	= [];
	prices_delta		= [];
	prices_delta2   	= [];
	this.durations 			= [];
	this.durationremaining 	= [];
	itemactivated 		= [];
	managerhired 		= [];
	balance 			= 0.00;
	this.durationbarlength  = 100; //160531 changed to 100 to fix a display bug when unlocking the last 2 items
	

	//++++++++++++++++++++++++Check for save jon and fill save area
	if(localStorage.Idlecraft_save!=null) {
		//document.getElementById("txt_savegame").innerHTML=localStorage.Idlecraft_save;
		//break_JSON_for_import();
	}
	//------------------------------------
	
	//---------
	this.bindclickevent = function() {

		var ic = this;
		for ( var i = 0 ; i < 10 ; i++ ) {

			$("#c2"+i).click( ( function(ii) {
				return function(){
					ic.item_generate_onclick(ii);
				}		
			} )(i) );


			$("#c4"+i).click( ( function(ii) {
				return function(){
					ic.item_upgrade_onclick(ii);
				}
			} )(i));

			$("#c6"+i).click( ( function(ii) {
				return function(){
					ic.item_hiremanager_onclick(ii);
				}
			} )(i));

			$("#icactivate"+i).click( ( function(ii) {
				return function(){
					ic.item_upgrade_onclick(ii);
				}
			} )(i));

			
		}	

		

		
	}

	//------------------
	this.createdom = function() {

		var ic = this;
		strhtml = "";
		for ( var row = 0 ; row < 5 ; row += 1 ) {
				
			strhtml += "<div class='ictrow'>";
			for ( var col = 0 ; col < 2 ; col += 1  ){

				var itemid = row * 2 + col;

				strhtml += "<div class='ictcol'>";
					strhtml += "<div class='icsubtable' id='ictable" + itemid + "'  style='display:none;' >";

							
					strhtml += "<div class='ictrow'>";
						strhtml += "<div class='ictcol1'>Item " + itemid +"<div id='c1"+ itemid +"' ></div></div>";
						strhtml += "<div class='ictcol2' id='c2"+ itemid +"'>"
							strhtml += "<div id='c2lbl"+ itemid +"'></div>";
							strhtml += "<div class='durationbar' id='durationbar"+ itemid +"'></div>";
						strhtml += "</div>"
					
					strhtml += "</div>"

		
					strhtml += "<div class='ictrow'>";
						strhtml += "<div class='ictcol3' id='c3" + itemid + "' >1</div>";
						strhtml += "<div class='ictcol4' id='c4" + itemid + "' ></div>";
					strhtml += "</div>"


					strhtml += "<div class='ictrow'>";
						strhtml += "<div class='ictcol5'></div>";
						strhtml += "<div class='ictcol6' id='c6" + itemid + "' >Hire Manager</div>";
					strhtml += "</div>"
						
						

					strhtml += "</div>"
					
					strhtml += "<div class='icactivate' id='icactivate"+ itemid+"'>Activate</div>"
										

				strhtml += "</div>"


				prices[itemid] 		  				= this.setting_price_base[itemid];
				prices_delta[itemid] 					= this.setting_price_delta[itemid]; 
				prices_delta2[itemid] 					= this.setting_price_delta2[itemid];
				this.generate_profits[itemid] 				= this.setting_generate_multiplier[itemid];
				this.durations[itemid] 						= this.setting_duration[itemid] ;
				this.durationremaining[itemid] 				= 0;	
				managerhired[itemid] 					= 0;

				if ( itemid == 0 ) {
					itemactivated[itemid] 		= 1;
				} else {
					itemactivated[itemid] 		= 0;
				}

			}

			strhtml += "</div>";

		}	
		$("#ictable").append(strhtml);
		
		


	}

	//-----
	this.debug = function() {

		
	}


	//-----------
	this.formatcurrency = function( currency ) {

		if ( currency > 1000000000 ) {
			return ( currency / 1000000000 ).toFixed(3) + " Billion";
		} else if ( currency > 1000000 ) {
			return ( currency / 1000000 ).toFixed(3) + " Million";
		}

		return currency.toFixed(2);
	}

	//---------
	this.gen_profit = function() {

		for ( var i = 0 ; i < 10 ; i++ ) {

			if ( itemactivated[i] > 0 ) {
				if ( this.durationremaining[ i ] > 0 ) {
					this.durationremaining[ i ] -= this.timerinterval ;
					
					if ( this.durationremaining[i] <= 0 ) {
						this.durationremaining[i] = 0;
						balance += this.generate_profits[i];
					
						if ( managerhired[i] == 1 ) {
							this.durationremaining[i] = this.durations[i];
						}
					}

				}
			}
		}

	}


	//-------------------------------
	this.init = function() {

		var ic = this;
		this.createdom();
		this.bindclickevent();
		this.debug();

		setTimeout( function() {
			ic.on_timer();
		},this.timerinterval );

	}	

	//------------
	this.item_generate_onclick = function( itemid ) {

		if ( this.durationremaining[itemid] == 0 ) {
			this.durationremaining[itemid] = this.durations[itemid];
		}
	}


	//------
	this.item_hiremanager_onclick = function( itemid ) {

		if ( managerhired[itemid] == 0 ) {
			if ( balance >= this.setting_managerprice[itemid] ) {
				
				balance -= this.setting_managerprice[itemid];
				managerhired[itemid] = 1;

				if ( this.durationremaining[itemid] <= 0 ) {
					this.durationremaining[itemid] = this.durations[itemid];
				}	
			}
		}
	}

	//-------
	this.item_upgrade_onclick = function( itemid ) {

		if ( balance >= prices[itemid] ) {
			
			balance -= prices[itemid];
			itemactivated[itemid] += 1;
			
			this.generate_profits[itemid] = this.setting_generate_multiplier[itemid] * itemactivated[itemid];
			
			prices[itemid] 		  += prices_delta[itemid];
			prices_delta[itemid]     += prices_delta2[itemid];
			prices_delta2[itemid]    += this.setting_price_delta3[itemid];
			
			// Double speed at 25th, 50th,100th upgrade..
			if ( itemactivated[itemid]  % 25 == 0 ) {
				var a = itemactivated[itemid] / 25;
				if ( (a & (a - 1)) == 0) {
					this.durations[itemid] = (this.durations[itemid] / 2) >> 0;
					if ( this.durations[ itemid ] < 1 ) {
						this.durations[itemid] = 1;
					}

				}
			}

		}	

	}
	
	//------
	this.renderval = function() {

		for ( var i = 0 ; i < 10 ; i++ ) {

			if ( itemactivated[i] > 0 ) {

				$("#ictable" + i).show();

				$("#c1"+i).html( "Time :" + this.durations[i] );

				if ( this.durationremaining[i] > 0 ) {
					$("#c2lbl"+i).html( "Generate: $ " + this.formatcurrency( this.generate_profits[i] ) + "<br/>" +  ( this.durationremaining[i]/1000 ).toFixed(3) + "s remaining");
				} else {
					$("#c2lbl"+i).html( "Generate: $ " + this.formatcurrency( this.generate_profits[i] ) );
				}

				if ( this.durations[i] <= 100 ) {
					var length_in_pixel = this.durationbarlength;
				} else {
					var length_in_pixel = ( this.durationremaining[i] * this.durationbarlength / this.durations[i] ) >> 0;
				}

				$("#durationbar" + i ).css("width", length_in_pixel + "px");
				
				$("#c3"+i).html( "Qty : " + itemactivated[i] );
				$("#c4"+i).html( "Buy : $ " + this.formatcurrency( prices[i] ) );
				
				if ( managerhired[i] == 1 ){
					$("#c6"+i).html("Manager Hired");
				} else {
					$("#c6"+i).html("Hire Manager : $ " + this.formatcurrency( this.setting_managerprice[i] ) );
				}

				$("#icactivate" + i).hide();

			} else {
				
				$("#ictable" + i).hide();
				$("#icactivate" + i).html("Activate for $ " +  this.formatcurrency( prices[i] ) );
				$("#icactivate" + i).show();

			}	
		}

		$("#balance").html( "Balance : $ " + this.formatcurrency( balance ) );
	}

	//------
	this.on_timer = function() {

		var ic = this;

		this.gen_profit();
		this.renderval();

		
		setTimeout( function() {
			ic.on_timer();
		},this.timerinterval );
	}

	
}

//------------------
function main() {
	ic = new Idlecraft();
	ic.init();
}

//++++++++++++++++++++++++Check for save jon and fill save area 20160529

function create_JSON_for_export() {
	//document.getElementById("txt_savegame").innerHTML=localStorage.Idlecraft_save;

	savegame_JSON=JSON.stringify({
		"generate_profits":generate_profits 	,
		"prices":prices   		  	,
		"prices_delta":prices_delta		,
		"prices_delta2":prices_delta2   	,
		"durations":durations		,
		"durationremaining":durationremaining 	,
		"itemactivated":itemactivated 		,
		"managerhired": managerhired 		,
		"balance": balance 	,		
		"durationbarlength":durationbarlength  
	}		
	);	  
  
	//savegame_JSON=JSON.stringify(tempsavedata);	
	localStorage.Idlecraft_save=savegame_JSON;
}

function break_JSON_for_import() {
//we assume load data are stored in localStorage.Idlecraft_save
	//document.getElementById("txt_savegame").innerHTML=localStorage.Idlecraft_save;
	savegame_JSON=localStorage.Idlecraft_save;

	var parsed_json = JSON.parse(savegame_JSON);
	//alert('temp_json.balance= ' + parsed_json["balance"] );
	generate_profits=parsed_json["generate_profits"];
	prices=parsed_json["prices"];
	prices_delta=parsed_json["prices_delta"];
	prices_delta2=parsed_json["prices_delta2"];
	durationremaining=parsed_json["durationremaining"];
	durations=parsed_json["durations"];
	managerhired=parsed_json["managerhired"];
	balance=parsed_json["balance"];
	itemactivated=parsed_json["itemactivated"];
	durationbarlength=parsed_json["durationbarlength"];
	
	//alert('JSON.parse(savegame_JSON) = ' +temp );
}

function savegame_export() {
	create_JSON_for_export();
	//document.getElementById("txt_savegame").innerHTML=localStorage.Idlecraft_save;//orig line
	document.getElementById("txt_savegame").value=localStorage.Idlecraft_save;
}
function loadgame_import() {
	localStorage.Idlecraft_save=document.getElementById("txt_savegame").value;
	break_JSON_for_import();
	//localStorage.Idlecraft_save="aaaa111";
	//localStorage.Idlecraft_save=document.getElementById("txt_test").value;
	//document.getElementById("txt_test").innerHTML=localStorage.Idlecraft_save;
}

