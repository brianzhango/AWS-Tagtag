import React, { useState } from "react";
import { render } from "react-dom";
import {API, Auth}from "aws-amplify";
// import {Amplify, Storage, API} from "aws-amplify";
import TextareaAutosize from "react-textarea-autosize";

const EncodeBase64 = () => {
    const [selectetdFile, setSelectedFile] = useState([]);
    const [fileBase64String, setFileBase64String] = useState("");
  
    const onFileChange = (e) => {
      // setSelectedFile(e.target.files);
      // console.log(e.target.files[0]);
      // console.log(e.target.files[0].name);
      // console.log(e.target.files[0].size);
      // console.log(e.target.files[0].type);
      var reader = new FileReader();
      if (e.target.files[0]) {
        reader.readAsDataURL(e.target.files[0]);
        reader.onload = async () => {
            var Base64 = reader.result;
            console.log(Base64);
            setFileBase64String(Base64);
            await API.post('tag-api', '/images', {
                headers: {

                  Authorization: `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}`,
                }, body: {
                    'id': Base64,
                },
                //queryStringParameters : {'id': Base64 }
            })
                .then(response => {
                    console.log(response);
                    var list1 =  response;

                    if(list1.length === 0)
                    {
                        document.getElementById("link-list2").innerHTML = "No matches found";
                    }
                    else {
                        var data = "<ul>";
                        for (var link = 0; link < list1.length; link++) {
                            data += "<li>" + list1[link] + "</li>"
                        }
                        data += "</ul>";
                        document.getElementById("link-list2").innerHTML = data;
                    }
                })
                .catch(error => {
                    console.log(error);
                })

        };
        reader.onerror = (error) => {
          console.log("error: ", error);
        };
      }
    };
  
    // };
  
    // const encodeFileBase64 = (file) => {
    //   var reader = new FileReader();
    //   if (file) {
    //     reader.readAsDataURL(file);
    //     reader.onload = async () => {
    //         var Base64 = reader.result;
    //         console.log(Base64);
    //         setFileBase64String(Base64);
    //         await API.post('tag-api', '/images', {
    //             headers: {

    //               Authorization: `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}`,
    //             }, body: {
    //                 'id': Base64,
    //             },
    //             //queryStringParameters : {'id': Base64 }
    //         })
    //             .then(response => {
    //                 console.log(response);
    //                 var list1 =  response;

    //                 if(list1.length === 0)
    //                 {
    //                     document.getElementById("link-list2").innerHTML = "No matches found";
    //                 }
    //                 else {
    //                     var data = "<ul>";
    //                     for (var link = 0; link < list1.length; link++) {
    //                         data += "<li>" + list1[link] + "</li>"
    //                     }
    //                     data += "</ul>";
    //                     document.getElementById("link-list2").innerHTML = data;
    //                 }
    //             })
    //             .catch(error => {
    //                 console.log(error.response);
    //             })

    //     };
    //     reader.onerror = (error) => {
    //       console.log("error: ", error);
    //     };
    //   }
    // };
  
    // encodeFileBase64(selectetdFile[0]);
  
    return (
      <div>
                <br />
        <input type="file" id="input" onChange={onFileChange} accept={"image/jpg"} />
        {/* <TextareaAutosize hidden="true"
          maxRows={20}
          value={fileBase64String}
          onChange={encodeFileBase64(selectetdFile[0])}
        /> */}
          <div id="link-list2"></div>
      </div>
    );
  };
  
  render(<EncodeBase64 />, document.querySelector("#root"));
// import React, { useState } from "react";

// import ReactDOM from 'react-dom';

// import FileBase64 from './react-file-base64.js';

// class App extends React.Component {

//   constructor() {
//     super()
//     this.state = {
//       files: []
//     }
//   }

//   getFiles(files){
//     this.setState({ files: files })
//   }

//   render() {

//     return (
//       <div>

//         <h1 className="text-center">React File to Base64 Converter</h1>

//         <div className="text-center mt-25">
//           <p className="text-center"> *) Try To Upload Some Image~</p>
//           <FileBase64
//             multiple={ true }
//             onDone={ this.getFiles.bind(this) } />
//         </div>

//         <div className="text-center">
//           { this.state.files.map((file,i) => {
//             return <img key={i} src={file.base64} />
//           }) }
//           <img src="" />
//         </div>

//         { this.state.files.length != 0 ?
//           <div>
//             <h3 className="text-center mt-25">Callback Object</h3>
//             <div className="pre-container">
//               <pre>{ JSON.stringify(this.state.files, null, 2) }</pre>
//             </div>
//           </div>
//         : null }

//       </div>
//     )

//   }

// }


// ReactDOM.render(<App />, document.getElementById("app"))

// function Query() {

//     return(

//         <h3>This is home page</h3>
//     );
    
//   }

  
export default EncodeBase64;