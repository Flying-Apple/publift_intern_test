var http = require('http');
var url = require('url');
var fs = require('fs');

http.createServer(function (req, res) {
    var png = Buffer.from([137,80,78,71,13,10,26,10])               //png identifier
    var q = url.parse(req.url, true);
    var filename = "." + q.pathname + ".html";                      //filename =  <pagename>.html
    fs.readFile(filename, function(err, data) {
        if (err) {
            res.writeHead(404, {'Content-Type': 'text/html'});
            return res.end("404 Not Found");
        }  
        var ispng=0;
        var issvg=0;
        if(q.pathname == "/question2" && q.search.substring(0,9)=="?content="){         //get content if path is question2
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.write(q.search.substring(9));
            return res.end();
        }
        else if (q.pathname == "/question3" && req.method == 'POST') {     //get post message
            body=[];        
            req.on('data', function (chunk) {
                body.push(chunk);
                if (chunk.slice(0,8).equals(png)){          //check first 8 bytes to see if the file is PNG [137,80,78,71,13,10,26,10]
                    ispng=1;
                    //console.log("good file");
                }
                else if (chunk.toString().substring(1,200).includes("svg")){    //check if first few lines contain "svg"
                                                                                              //not a good practice, can be tricked by file with "svg" in it
                    issvg=1;
                    //console.log("good file");
                }       
            });
            
            req.on('end', function() {
                    if (issvg==0 && ispng==0){
                        return res.end("not valid file")
                    }
                body = Buffer.concat(body).toString('base64');
                var decodeImg = new Buffer(body, 'base64')
                if (ispng==1){
                    var filename1 = "Received_png.png";
                    writeFile();
                }   
                else if(issvg==1){
                    var filename1 = "Received_svg.svg";
                    writeFile();            
                }
                function writeFile() {                          
                    if ((fs.existsSync(filename1))) {
                        console.log("file " + filename1 + "exists, use a new name");
                        filename1 ="0"+ filename1;
                        writeFile();
                    }
                    else {
                        fs.writeFile(filename1, decodeImg,'base64', function(err){
                            if (err){
                                console.log(err)
                            }
                            else{
                                console.log("done: " + filename1);
                                return res.end("done: " + filename1);
                            }
                            })
                    }             
                }//writefile
                
            });//req.on
          }//else if
        else{
            res.writeHead(200, {'Content-Type': 'text/html'});      //open page here
            res.write(data);
            return res.end();
        }
    });

}).listen(8080);
