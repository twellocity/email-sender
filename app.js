"use strict";
var nodemailer = require('nodemailer');
var mail_user, mail_pass, mail_host, mail_port, mail_from;

function init() {
	
	//mail settings (if any)
	mail_user = Homey.manager('settings').get('mail_user');
	mail_pass = Homey.manager('settings').get('mail_password');
	mail_host = Homey.manager('settings').get('mail_host');
	mail_port = Homey.manager('settings').get('mail_port');
	mail_from = Homey.manager('settings').get('mail_from');

	Homey.log('Backend settings updated');

}

//module.exports.testmail = testmail;
module.exports.init = init;

Homey.manager('settings').on('set', function (name) {

	Homey.log('variable ' + name + ' has been set');
	init();
	
});

// flow action handlers
Homey.manager('flow').on('action.sendmail', function (callback, args) {

	Homey.log('take snapshot - ' + snappath);
	
	if ( typeof mail_user !== 'undefined' && typeof mail_pass !== 'undefined' && typeof mail_host !== 'undefined' && typeof mail_port !== 'undefined' && typeof mail_from !== 'undefined') {
	
		syno.query(snappath, {
				api    		: 'SYNO.SurveillanceStation.SnapShot',
				version		: 1,
				method 		: 'TakeSnapshot',
				camId  		: args.device.id,
				blSave		: false,
				dsId		: 0,
				'_sid' 		: sid
				
			}, function(err, data) {
				
				if (err) {
					Homey.log (err);
					callback (null, false);
				}
				
				Homey.log ('result: ' + JSON.stringify(data));
				
				var transporter = nodemailer.createTransport(
				{
					host: mail_host,
					port: mail_port,
					auth: {
						user: mail_user,
						pass: mail_pass
					},
					tls: {rejectUnauthorized: false} 
				});
			    
			    var mailOptions = {
					
					from: 'Homey <' + mail_from + '>',
				    to: args.mailto,
				    subject: 'Snapshot from camera #' + args.device.id,
				    text: '',
				    html: '',
			    
				    attachments: [
				        {   
					        filename: data.data.fileName,
				            content: new Buffer(data.data.imageData, 'base64')
				        }
			        ]
			    }
			    
			    transporter.sendMail(mailOptions, function(error, info){
				    if(error){
					    callback (null, false);
				        return Homey.log(error);
				    }
				    Homey.log('Message sent: ' + info.response);
				    callback (null, true);
				});
				
			});
			
		} else {
			
			Homey.log('Not all required variables for mailing have been set');
		    
			callback (null, false);
			
		}
	
});