import React from "react";
import {Amplify, API, Auth, Storage}from "aws-amplify";
import {AmplifyAuthenticator, AmplifySignUp, AmplifySignOut} from "@aws-amplify/ui-react";
import { AuthState, onAuthUIStateChange } from '@aws-amplify/ui-components';
import awsconfig from "./aws-exports";
import './App.css';
import { BrowserRouter as Router,Switch, Route, Link} from 'react-router-dom';
import Query from "./Query";

Amplify.configure(awsconfig);

Amplify.configure({
  // OPTIONAL - if your API requires authentication 
  // Auth: {
  //     // REQUIRED - Amazon Cognito Identity Pool ID
  //     identityPoolId: 'XX-XXXX-X:XXXXXXXX-XXXX-1234-abcd-1234567890ab',
  //     // REQUIRED - Amazon Cognito Region
  //     region: 'XX-XXXX-X', 
  //     // OPTIONAL - Amazon Cognito User Pool ID
  //     userPoolId: 'XX-XXXX-X_abcd1234', 
  //     // OPTIONAL - Amazon Cognito Web Client ID (26-char alphanumeric string)
  //     userPoolWebClientId: 'a1b2c3d4e5f6g7h8i9j0k1l2m3',
  // },
  API: {
      endpoints: [
          {
              name: "tag-api",
              endpoint: "https://wdjf4zqzm4.execute-api.us-east-1.amazonaws.com/dev"
          },
      ]
  }
});


const AuthStateApp = () => {
  const [authState, setAuthState] = React.useState();
  const [user, setUser] = React.useState();



  React.useEffect(() => {
    return onAuthUIStateChange((nextAuthState, authData) => {
      setAuthState(nextAuthState);
      setUser(authData)
    });
  }, []);

  const [tagStr, setTagStr] = React.useState('');

  const loadImages = async () => {
      const tags = document.querySelector("#tag").value
      console.log(tags)
      let params = tags
      console.log(params)


      await API.get('tag-api', `/tags?tags=${params}`, {
          headers: { 
             Authorization: `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}`,
          }, })
          .then(response => {
                console.log(response.links[0]);
                var list1 =  response.links;

                if(list1.length === 0)
                {
                    document.getElementById("link-list").innerHTML = "No matches found";
                }
                else {
                    var data = "<ul>";
                    for (var link = 0; link < list1.length; link++) {
                        data += "<li>" + list1[link] + "</li>"
                    }
                    data += "</ul>";
                    document.getElementById("link-list").innerHTML = data;
                }
          })
          .catch(error => {
              console.log(error.response);
          })
  }

  const searchTag = () => {
      return (
          <>
            <div>
              <label>
                  Search Tag
                  <input id = "tag" type="text" placeholder="add tags seperated by ," value={tagStr} onChange={e => setTagStr(e.target.value)}/>
                  <button onClick={loadImages}>Search</button>
              </label>
            </div>
              <div id="link-list"></div>
          </>
      )
  }

  const uploadTags = async () => {
    const tag = document.querySelector("#addTag").value
    const url = document.querySelector("#addUrl").value

    console.log(tag)


    await API.post('tag-api', '/tags', {
        headers: {
           Authorization: `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}`,
        }, body: {
            'id': url, 'tags':tag}})
        .then(response => {
            document.getElementById("output1").innerHTML = "Inserted Successfully!";
        })
        .catch(error => {
            console.log(error.response);
        })
  }


  const deleteUrl = async () => {
    const delurl = document.querySelector("#deleteUrl").value

    console.log(delurl)


    await API.del('tag-api', '/tags', {
        headers: {
                Authorization: `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}`,
        }, body: {
            'id': delurl}})
        .then(response => {
            document.getElementById("output2").innerHTML = "Deleted Successfully!";
        })
        .catch(error => {
            console.log(error.response);
        })
  }
  //upload
  const [uploadProgress, setUploadProgress] = React.useState('getUpload');
  const [uploadImage, setUploadImage] = React.useState();
  const [errorMessage, setErrorMessage] = React.useState();
  const upload = async () => {
      try
      {
          setUploadProgress('uploading')
          await Storage.put(uploadImage.name, uploadImage, {contentType: 'image/jpg'});
          setUploadProgress('uploaded')
      } catch (error) {
          console.log('Error uploading file: ', error);
          setErrorMessage(error.message)
          setUploadProgress('uploadError')
      }
  }

  const uploadContent = () => {
      switch (uploadProgress) {
          case 'getUpload':
              return (
                  <>
                      <input type={"file"} accept={"image/*"} onChange={e => setUploadImage(e.target.files[0])}/>
                      <button onClick={upload}>Upload</button>
                  </>
              )
          case 'uploaded':
              return (
                  <>
                      <h2>Uploaded successfully!</h2>
                      <input type={"file"} accept={"image/*"} onChange={e => setUploadImage(e.target.files[0])}/>
                      <button onClick={upload}>Upload</button>
                  </>
              )
          case 'uploading':
              return (
                  <>
                      <h2>Uploading...</h2>
                  </>
              )
          case 'uploadError':
              return (
                  <>
                      <div>
                        Error message = {errorMessage}
                      </div>
                      <input type={"file"} accept={"image/*"} onChange={e => setUploadImage(e.target.files[0])}/>
                      <button onClick={upload}>Upload</button>
                  </>
              )
          default:
              break;
      }



  }

  return authState === AuthState.SignedIn && user ? (
      <div className="App">
          <header className="App-header">
              <div>Hello, Welcome to TagTag!</div>
              <br />
              <label>
                  Upload image to the database
              </label>
            <div>
                {uploadContent()}
            </div>
              <br />
            <div>
                {searchTag()}
            </div>
              <br />
            <div>
              <label>
                  Add tags
                  <input id="addTag" type="text" placeholder="tags seperated by ," name="tag" />
              </label>
            </div>
            <div>
              <label>
                  Enter image Url
                  <input id="addUrl" type="text" name="url" />
                  <button onClick={uploadTags}>Add</button>
              </label>
            </div>
              <div id="output1"></div>
              <br />
            <div>
              <label>
                  Delete Image
                  <input id="deleteUrl" type="text" name="url" />
                  <button onClick={deleteUrl}>Delete</button>
              </label>
            </div>
              <div id="output2"></div>
              <br />
              <Router>
                  <label>
                      Click here
                  </label>
                  <Link to="/query">Upload image to find images with same tags:</Link>
                  <Switch>
                      <Route path={"/query"}>
                          <Query/>
                      </Route>
                  </Switch>
              </Router>
              <br />
              <AmplifySignOut />
          </header>
      </div>
  ) : (
      <AmplifyAuthenticator>
        <AmplifySignUp
            slot="sign-up"
            formFields={[
              {type: "username"},
              {type: "password"},
              {
                type: "given_name",
                label: "Given Name *",
                placeholder: "Enter your given name",
                inputProps: { required: true },
              },
              {
                type: "family_name",
                label: "Family Name *",
                placeholder: "Enter your family name",
                inputProps: { required: true },
              }
            ]}
        />
      </AmplifyAuthenticator>
  );
}

export default AuthStateApp;