import React, { Component } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Keyboard,
  KeyboardAvoidingView,
  ScrollView,
  ActivityIndicator,
  Image
} from "react-native";

//TODO: Read about UUID
import uuid from 'uuid';
import * as firebase from 'firebase';
import { Form, Item, Input, Label, Button } from "native-base";

import * as ImagePicker from 'expo-image-picker';

import { Header } from "react-navigation";


//TODO: add firebase

export default class AddNewContact extends Component {

  constructor(props){
    super(props);
    this.state = {
      fname: "",
      lname: "",
      phone: "",
      email: "",
      address: "",
      image: "empty",
      imageDownloadUrl: "empty",
      isUploading: false


    }
  }

  static navigationOptions = {
    // set screen header title
    title: "Add Contact"
  };
  //TODO: create constructor with state: fname, lname, phone, email, address, image, imageDownloadUrl, isUploading

  //TODO: savecontact method
  saveContact = async () => {
    // create and save contact to firebase
    if(
      this.state.fname !== "" &&
      this.state.lname !== "" &&
      this.state.phone !== "" &&
      this.state.email !== "" &&
      this.state.address !== "" 
      ){

        this.setState({isUploading: true});
        const dbReference = firebase.database().ref();
        const storageRef = firebase.storage().ref();
        if(this.state.image !== "empty"){
          const getDownloadURL = await this.uploadImageAsync(this.state.image, storageRef);
          this.setState({imageDownloadUrl: getDownloadURL});
        }

        //save values to an object
        var contact = {
          fname: this.state.fname,
          lname: this.state.lname,
          phone: this.state.phone,
          email: this.state.email,
          address: this.state.address,
          imageUrl: this.state.imageDownloadUrl


        };
        await dbReference.push(contact, err => {
          if(!err){
            return this.props.navigation.goBack();
          }
        });
    }

  };
  //TODO: pick image from gallery
  pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      quality: 0.2,
      base64: true,
      allowsEditing: true,
      aspect: [1, 1],


    })

    if(!result.cancelled){
      this.setState({image: result.uri});
    }
  };

  //TODO: upload image to firebase
  uploadImageAsync = async (uri, storageRef) => {
    const parts = uri.split(".");
    const fileExtension = parts[parts.length - 1];

    //create blob
    const blob = await new Promise((resolve, reject)=> {
      const xhr = new XMLHttpRequest();
      xhr.onload = function(){
        resolve(xhr.response)
      };
      xhr.onerror = function(e){
        console.log("thefucking error "+e);
        reject(new TypeError("Network Request Failed"))
      }
      xhr.responseType = "blob";
      xhr.open("GET", uri, true);
      xhr.send(null);
    })

//upload part
const ref = storageRef
    .child("ContactImages")
    .child(uuid.v4()+"."+fileExtension);
    const snapshot = await ref.put(blob);

    //close blog
    blob.close();
    return await snapshot.ref.getDownloadURL();
  };

  //render method
  render() {
    if (this.state.isUploading) {
      return (
        <View
          style={{ flex: 1, alignContent: "center", justifyContent: "center" }}
        >
          <ActivityIndicator size="large" color="#B83227" />
          <Text style={{ textAlign: "center" }}>
            Contact Uploading please wait..
          </Text>
        </View>
      );
    }
    return (
      
        <TouchableWithoutFeedback
          onPress={() => {
            // dismiss the keyboard if touch any other area then input
            Keyboard.dismiss();
          }}
        >
          <ScrollView style={styles.container} keyboardShouldPersistTaps={'always'}>
            <TouchableOpacity
              onPress={() => {
                this.pickImage();
              }}
            >
              <Image
                source={
                  this.state.image === "empty"
                    ? require("../assets/person.png")
                    : {
                        uri: this.state.image
                      }
                }
                style={styles.imagePicker}
              />
            </TouchableOpacity>

            <Form>
              <Item style={styles.inputItem} floatingLabel>
                <Label>First Name</Label>
                <Input
                  autoCorrect={false}
                  autoCapitalize="none"
                  keyboardType="default"
                  onChangeText={fname => this.setState({ fname })}
                />
              </Item>
              <Item style={styles.inputItem} floatingLabel>
                <Label>Last Name</Label>
                <Input
                  autoCorrect={false}
                  autoCapitalize="none"
                  keyboardType="default"
                  onChangeText={lname => this.setState({ lname })}
                />
              </Item>
              <Item style={styles.inputItem} floatingLabel>
                <Label>Phone</Label>
                <Input
                  autoCorrect={false}
                  autoCapitalize="none"
                  keyboardType="number-pad"
                  onChangeText={phone => this.setState({ phone })}
                />
              </Item>
              <Item style={styles.inputItem} floatingLabel>
                <Label>Email</Label>
                <Input
                  autoCorrect={false}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  onChangeText={email => this.setState({ email })}
                />
              </Item>
              <Item style={styles.inputItem} floatingLabel>
                <Label>Address</Label>
                <Input
                  autoCorrect={false}
                  autoCapitalize="none"
                  keyboardType="default"
                  onChangeText={address => this.setState({ address })}
                />
              </Item>
            </Form>

            <Button
              style={styles.button}
              full
              rounded
              onPress={() => {
                // save contact
                this.saveContact();
              }}
            >
              <Text style={styles.buttonText}>Save</Text>
            </Button>
          </ScrollView>
        </TouchableWithoutFeedback>
      
    );
  }
}
// styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    margin: 10
  },
  imagePicker: {
    justifyContent: "center",
    alignSelf: "center",
    width: 100,
    height: 100,
    borderRadius: 100,
    borderColor: "#c1c1c1",
    borderWidth: 2
  },
  inputItem: {
    margin: 10
  },
  button: {
    backgroundColor: "#7b1fa2",
    marginTop: 40
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold"
  }
});
