import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ILoginResponse } from './models/ILoginResponse';

import{ IUser } from './models/IUser';
const endpoint = 'http://ec2-34-217-107-14.us-west-2.compute.amazonaws.com:8080';
// const endpoint = 'http://10.84.56.43:8080';

const context = endpoint + '/api/stork';

@Injectable({
  providedIn: 'root'
})

export class APICallsService {

  constructor(private httpService:HttpClient) { }

  headers = new HttpHeaders().append('Content-Type','application/json')
                             .append('Access-Control-Allow-Origin','*');

  /*
    Desc: Send a code to the user
    input: Email
    accept: (successMessage:string){}
    fail: (errorMessage:string){}
  */
  public resetPasswordSendCode(email){
    console.log("in resetpass");
    var URL = context+'/user';
    let body = JSON.stringify({action: 'sendVerificationCode',email: email});
    return this.httpService.post(URL,body,{headers: this.headers});
  }
  

  /*
    Desc: Verify Code for the user
    input: Email
    accept: (successMessage:string){}
    fail: (errorMessage:string){}
  */
  public resetPasswordVerifyCode(email,code){
    console.log("In resetPasswordVerifyCode");
    var URL = context+'/user';
    let body = JSON.stringify({action: 'verifyCode',email: email,code:code});
    return this.httpService.post(URL,body,{headers: this.headers});
  }

  /*
    Desc: Send a code to the user
    input: Email
    accept: (successMessage:string){}
    fail: (errorMessage:string){}
  */

  public resetPassword(email,code,password, cpassword){
    console.log("In resetPassword");
    var URL = context+'/user';
    let body = JSON.stringify({action: 'setPassword',email: email,code:code,
                                password: password,confirmPassword: cpassword});    
    return this.httpService.post(URL,body,{headers: this.headers});
  }


  /*
    Desc: Login and return a hash
    input: Email
    accept: (successMessage:string){}
    fail: (errorMessage:string){}
  */
  public login(email, password): Observable<ILoginResponse>{
    var URL = context+'/user';               
    let body = JSON.stringify({action: 'login',email: email,password: password});
    return this.httpService.post<ILoginResponse>(URL,body,{headers: this.headers});
  }


  public isAdmin(email, hash){
    var URL = context+'/user';
    let body = JSON.stringify({action: 'isAdmin',email: email,password: hash});
    return this.httpService.post(URL,body,{headers: this.headers});
  }

  public getFTPCreds(email, hash, uri : string = '') : Observable<any>{
    var URL = context+'/user';
    let body = JSON.stringify({action: 'history',email: email,password: hash, uri : uri});
    return this.httpService.post<any>(URL,body,{headers: this.headers});
  }

  public deleteCredential(deleteAction, identifier,email,hash){
    var URL = context+'/user';               
    let body : any = {action: deleteAction, email: email, password: hash}
    if(deleteAction === 'deleteCredential')
      body['uuid'] = identifier;
    else if(deleteAction === 'deleteHistory')
      body['uri'] = identifier;
    body = JSON.stringify(body);
    return this.httpService.post(URL,body,{headers: this.headers});
  }

  /*
    Desc: List credentials for dropbox and googledrive
  */
  public getCredList(email, hash) : Observable<any>{
    let URL = context + "/cred";
    let reqParams = new HttpParams().set("action", "list")
                                    .set("email", email).set("hash", hash);
    return this.httpService.get<any>(URL,{headers: this.headers,params: reqParams});
  }

  /*
    Desc: Extract all transfers for the user
  */
  public queue(email,hash){
    var URL = context+'/q';
    let body = JSON.stringify({status: 'all',email: email, password: hash});
    return this.httpService.post(URL,body,{headers: this.headers});
  }

  public submit(email, hash, src, dest, options) : Observable<any>{
    // console.log("Src - ", src);
    // console.log("Dest - ", dest);
    // console.log("Options - ", options);

    var URL = context+'/submit';
    let body = JSON.stringify({'email': email, 'password': hash,
                               'src' : src, 'dest': dest, 'options': options});
    console.log("Body - " , body);
    return this.httpService.post<any>(URL,body,{headers: this.headers});
  }

  public listFiles(email, hash, uri, type, credential, id) : Observable<any>{
    var URL = context+'/ls';
    let body = {
      "email": email,
      "password" : hash,
      "uri" : encodeURI(uri),
      "type" : encodeURI(type),
      "depth" : 1,
      "id" : null
    };
    if(id !== null && id !== undefined)
      body["id"] = id;
    
    if(credential !== null && credential !== undefined)
      body["credential"] = credential;

    return this.httpService.post<any>(URL,body,{headers: this.headers});
  }

  public mkdir(email, hash, uri, type, credential, id, idMap): Observable<any>{

    var URL = context+'/mkdir';              
    let body = {
      "email": email,
      "password" : hash,
      "uri" : encodeURI(uri),
      "type" : encodeURI(type),
      "depth" : 1,
      "id" : null,
      "map" : idMap
    };
    console.log(body);

    if(id !== null && id !== undefined)
      body["id"] = id;
    
    if(credential !== null && credential !== undefined)
      body["credential"] = credential;

    return this.httpService.post<any>(URL,body,{headers: this.headers});

  }

  public deleteCall(email, hash, uri, type, credential, id, idMap){
    var URL = context+'/delete';              
    let body = {
      "email": email,
      "password" : hash,
      "uri" : encodeURI(uri),
      "type" : encodeURI(type),
      "depth" : 1,
      "id" : null,
      "map" : idMap
    };
    console.log(body);

    if(id !== null && id !== undefined)
      body["id"] = id;
    
    if(credential !== null && credential !== undefined)
      body["credential"] = credential;

    return this.httpService.post<any>(URL,body,{headers: this.headers});
  }

  public getUser(email):Observable<IUser>{
    var URL = context+'/user';               
    let body = JSON.stringify({action: 'getUser',email: email});
    return this.httpService.post<IUser>(URL,body,{headers: this.headers});
  }

  /*
    Desc: Change Password
  */
  public changePassword(oldPassword, newPassword,confirmPassword,email,hash){
    var URL = context+'/user';
    let body = JSON.stringify({action: 'resetPassword',oldPassword: oldPassword,
                              newPassword:newPassword,confirmPassword: confirmPassword,
                              email:email,password:hash});    
    return this.httpService.post(URL,body,{headers: this.headers});
  }

  public cancelJob(jobID, email, hash){
    var URL = context+'/cancel';
    let body = JSON.stringify({job_id: jobID,email: email,password: hash});
    return this.httpService.post(URL,body,{headers: this.headers});
  }

  public restartJob(jobID, email, hash){
    var URL = context+'/restart';
    let body = JSON.stringify({job_id: jobID,email: email,password: hash});
    return this.httpService.post(URL,body,{headers: this.headers});
  }

  public deleteJob(jobID, email, hash){
    var URL = context+'/deleteJob';
    let body = JSON.stringify({job_id: jobID,email: email,password: hash});
    return this.httpService.post(URL,body,{headers: this.headers});
  }
  public getClientInfo(email, hash){
    console.log(email,hash);
    var URL = context+'/user';
    let body = JSON.stringify({action:"getUsers",email: email,password: hash});
    return this.httpService.post(URL,body,{headers: this.headers});
  }


  public completeOAuth(protocol : string, state : string, code : string, 
                       email : string, hash : string) : Observable<any>{
    let URL = context + "/oauth";

    if(protocol === "Dropbox"){
      URL += "/dropbox"
    }
    else if(protocol === "GoogleDrive"){
      URL += "/googledrive";
    }
                    
    let reqParams = new HttpParams().set("state", state).set("code", code)
                                    .set("email", email).set("hash", hash);
    return this.httpService.get<any>(URL,{headers: this.headers, params: reqParams});
  }



  public getDropboxOAuthLink(){
    return endpoint + "/api/stork/oauth?type=dropbox";
  }

  public getGoogleDriveOAuthLink(){
    return endpoint + "/api/stork/oauth?type=googledrive";
  }

  public getGridFtpOAuthLink(){
    return endpoint + "/api/stork/oauth?type=gridftp";
  }

  public registerUser(email,firstName,lastName,organization) {
    var URL = context+'/user';
    let body = JSON.stringify({action: 'register',email: email,firstName:firstName,lastName: lastName,organization: organization});    
    return this.httpService.post(URL,body,{headers: this.headers});
  }

}    //APICallsService
