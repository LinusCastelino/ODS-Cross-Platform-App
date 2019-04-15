import { Injectable } from '@angular/core';
import Axios from "axios";
import {url, getTypeFromUri} from './constants';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ILoginResponse } from './models/ILoginResponse';

import{ IUser } from './models/IUser';
const endpoint = 'http://10.84.27.57:8080';


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

  public getFTPCreds(email, hash) : Observable<any>{
    var URL = context+'/user';
    let body = JSON.stringify({action: 'history',email: email,password: hash, uri : ''});
    return this.httpService.post<any>(URL,body,{headers: this.headers});
  }

  public deleteCredential(deleteAction, uri,email,hash){
    var URL = context+'/user';               
    let body = JSON.stringify({action: deleteAction,uuid:uri,email: email,password: hash});
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

  public share(uri, endpoint, accept, fail){
    var callback = accept;

    // this.axios.post(url+'share', {
    //     credential: endpoint.credential,
    //     uri: encodeURI(uri),
    //     type: getTypeFromUri(uri),
    //     // map: getMapFromEndpoint(endpoint),                    ################ TODO

    // })
    // .then((response) => {
    //   if(!(response.status === 200))
    //     callback = fail;
    //   // this.statusHandle(response, callback);
    // })
    // .catch((error) => {
        
    //     // this.statusHandle(error, fail);
    //   });
  }

  public mkdir(uri,type, endpoint,  accept, fail){
    var callback = accept;
    // const id = getIdsFromEndpoint(endpoint);       ################ TODO
    // this.axios.post(url+'mkdir', {
    //     credential: endpoint.credential,
    //     uri: encodeURI(uri),
    //     // id: id,                                  ################3333
    //     type: type,
    //     // map: getMapFromEndpoint(endpoint),       ################ TODO
    // })
    // .then((response) => {
    //   if(!(response.status === 200))
    //     callback = fail;
    //   // this.statusHandle(response, callback);
    // })
    // .catch((error) => {
    //     // this.statusHandle(error, fail);
    //   });
  }

  public deleteCall(uri, endpoint, id, accept, fail){
    console.log("screw")
    var callback = accept;
    // this.axios.post(url+'delete', {
    //     credential: endpoint.credential,
    //     uri: encodeURI(uri),
    //     id: id,
    //     type: getTypeFromUri(uri),
    //     // map: getMapFromEndpoint(endpoint)               ################ TODO
    // })
    // .then((response) => {
    //   if(!(response.status === 200))
    //     callback = fail;
    //   // this.statusHandle(response, callback);
    // })
    // .catch((error) => {
        
    //     // this.statusHandle(error, fail);
    //   });
  }


  // public download(uri, credential){
  //   // no download functionality on mobile app
  // }

  // public upload(uri, credential, accept, fail){
  //   // no upload functionality on mobile app
  // }

  /*
    Desc: Retrieve all the available users
  */
  public getUsers(type, accept, fail){
    var callback = accept;

    // this.axios.post(url+'user', {
    //     action: type
    // })
    // .then((response) => {
    //   if(!(response.status === 200))
    //     callback = fail;
    //   // this.statusHandle(response, callback);
    // })
    // .catch((error) => {
        
    //     // this.statusHandle(error, fail);
    //   });
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
    let body = JSON.stringify({action: 'resetPassword',password: oldPassword,
                              newPassword:newPassword,confirmPassword: confirmPassword,
                              email:email,hash:hash});    
    return this.httpService.post(URL,body,{headers: this.headers});
  }

  public cancelJob(jobID, email, hash){
    var URL = context+'/cancel';
    let body = JSON.stringify({job_id: jobID,email: email,password: hash});
    return this.httpService.post(URL,body,{headers: this.headers});
  }

  public restartJob(jobID, email, hash){
    console.log(jobID,email,hash);
    var URL = context+'/restart';
    let body = JSON.stringify({job_id: jobID,email: email,password: hash});
    return this.httpService.post(URL,body,{headers: this.headers});
  }

  public getClientInfo(email, hash){
    console.log(email,hash);
    var URL = context+'/user';
    let body = JSON.stringify({action:"getUsers",email: email,password: hash});
    return this.httpService.post(URL,body,{headers: this.headers});
  }


  public completeOAuth(state : string, code : string, email : string, hash : string) : Observable<any>{
    let URL = context + "/oauth";
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


  public verifyRegistraionCode(emailId, code) {
    // return this.axios.post(url+'user', {
    //     action: "verifyCode",
    //     email : emailId,
    //     code : code
    //   })
    //   .then((response) => {
    //     return response;
    //     //this.statusHandle(response, callback);
    //   })
    //   .catch((error) => {
    //     //this.statusHandle(error, fail);
    //     console.error("Error while verifying the registration code")
    //     return {status : 500}
    //   });
  }

  public setPassword(emailId, code, password, confirmPassword) {
    // return this.axios.post(url+'user', {
    //     action: "setPassword",
    //     email : emailId,
    //     code : code,
    //     password : password,
    //     confirmPassword : confirmPassword
    // })
    // .then((response) => {
    //   if(!(response.status === 200))
    //     throw new Error("Failed to set password for users account")
    //   else {
    //     return response;
    //   }
    //   //this.statusHandle(response, callback);
    // })
    // .catch((error) => {
    //   //this.statusHandle(error, fail);
    //   return {status : 500}
    // });
  }

}    //APICallsService
