#!/usr/bin/env node

var assert = require('assert');
var util = require('util');
var fix = require('../fix.js');

function clientServerTest(){
    var server = new fix.FIXServer("SERVER",{});
    server.onMsg(function(id, msg){
            util.log(">>>>>SERVER("+id+"):"+JSON.stringify(msg));        
    });
    server.onOutMsg(function(id, msg){
            util.log("<<<<<SERVER("+id+"):"+JSON.stringify(msg));        
    });
    server.onStateChange(function(id, msg){
            util.log("-----SERVER("+id+"):"+JSON.stringify(msg));        
    });
    server.onError(function(id, msg){
            util.log(">> >> >>SERVER("+id+"):"+JSON.stringify(msg));        
    });
    server.listen(1234);
    
    
    
    var client = new fix.FIXClient("FIX.4.2","CLIENT","SERVER",{});
    client.createConnection({port:1234}, function(session){
        session.onMsg(function(msg){
            util.log(">>>>>CLIENT:"+JSON.stringify(msg));
        });
        session.onOutMsg(function(msg){
            util.log("<<<<<CLIENT:"+JSON.stringify(msg));
        });
        session.onError(function(msg){
            util.log(">> >> >>CLIENT:"+JSON.stringify(msg));
        });
        session.onStateChange(function(msg){
            util.log("-----CLIENT:"+JSON.stringify(msg));
        });
        
        session.sendLogon();
    });
}

function fixSessionTest(){
    var f = new fix.FIXSession("FIX.4.2","SNDRCMPID","TRGTCMPID", {});

    f.onOutMsg(function(msg){
        assert.equal(msg[35],"A","Expected outgoing message to be logon 'A'");
        assert.equal(msg[8],"FIX.4.2");
        assert.equal(msg[49],"SNDRCMPID");
        assert.equal(msg[56],"TRGTCMPID");
        //assert.equal(msg[52],"A");
    });
    
    f.sendLogon();

}

function fixSessionTest2(){
    var outCounter = 1;
    var f = new fix.FIXSession("FIX.4.2","SNDRCMPID","TRGTCMPID", {});

    f.onOutMsg(function(msg){
        console.log("OUT:"+JSON.stringify(msg));
        
        if(outCounter ===1){
            assert.equal(msg[35],"A","Expected outgoing message to be logon 'A'");
            assert.equal(msg[8],"FIX.4.2");
            assert.equal(msg[49],"SNDRCMPID");
            assert.equal(msg[56],"TRGTCMPID");
            //assert.equal(msg[52],"A");
        }
        if(outCounter === 2){
            assert.equal(msg[35],"0","Expected outgoing message to be heartbeat '0'");
            assert.equal(msg[8],"FIX.4.2");
            assert.equal(msg[49],"SNDRCMPID");
            assert.equal(msg[56],"TRGTCMPID");
            //assert.equal(msg[52],"A");
        }
        outCounter++;
    });
    
    f.onError(function(msg){
        console.log("ERROR:"+JSON.stringify(msg));
    });
    
    f.onMsg(function(msg){
        console.log("MSG:"+JSON.stringify(msg));
    });
    
    f.processIncomingMsg({8:"FIX.4.2", 49:"SNDRCMPID", 56:"TRGTCMPID", 52: new Date().getTime(), 34:1, 35:"A", 108:"10"});
    f = null;
}

function testClient(){
    
    var fixc = new fix.FIXClient("FIX.4.2","SNDRCMPID","TRGTCMPID", {});
    //fixc.connect("remotehost",8080);
    fixc.connect("debug", function(session, error){
        //connection attempt resulted in error
        assert.fail(error,error);
        
        session.sendLogon();
        
        //connected
        fix.onmsg(function(msg){
            assert.equal(msg[34],"A","Expected first message to be logon 'A'");
        });
    });
    
    //fixc.setOption("send-heartbeats","true");
    
}

//Execute tests
//fixSessionTest();
//fixSessionTest2();
clientServerTest();