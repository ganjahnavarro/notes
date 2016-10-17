/**
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *			http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

// Initializes Notes.
function Notes() {
	this.checkSetup();

	// Shortcuts to DOM Elements.
	this.userPic = document.getElementById('user-pic');
	this.userName = document.getElementById('user-name');
	this.signInButton = document.getElementById('sign-in');
	this.signOutButton = document.getElementById('sign-out');
	this.snackbar = document.getElementById('snackbar');

	console.log(this.snackbar);

	this.addButton = document.getElementById('add-note');

	// Saves message on form submit.
	this.signOutButton.addEventListener('click', this.signOut.bind(this));
	this.signInButton.addEventListener('click', this.signIn.bind(this));
	this.addButton.addEventListener('click', this.addNote.bind(this));

	this.initFirebase();
}

// Sets up shortcuts to Firebase features and initiate firebase auth.
Notes.prototype.initFirebase = function() {
	// Shortcuts to Firebase SDK features.
	this.auth = firebase.auth();
	this.database = firebase.database();
	this.storage = firebase.storage();
	// Initiates Firebase auth and listen to auth state changes.
	this.auth.onAuthStateChanged(this.onAuthStateChanged.bind(this));
};

// Signs-in Friendly Chat.
Notes.prototype.signIn = function() {
	// Sign in Firebase using popup auth and Google as the identity provider.
	var provider = new firebase.auth.FacebookAuthProvider();
	this.auth.signInWithPopup(provider);
};

// Signs-out of Friendly Chat.
Notes.prototype.signOut = function() {
	// Sign out of Firebase.
	this.auth.signOut();
};

Notes.prototype.addNote = function() {
	var data = {
		message: "Note saved",
		timeout: 2000
	};

	firebase.database().ref('notes').push({
		date: new Date(),
		user: firebase.auth().currentUser.uid,
		body : simplemde.value()
	});

	this.snackbar.MaterialSnackbar.showSnackbar(data);
}

// Triggers when the auth state change for instance when the user signs-in or signs-out.
Notes.prototype.onAuthStateChanged = function(user) {
	if (user) { // User is signed in!
		// Get profile pic and user's name from the Firebase user object.
		var profilePicUrl = user.photoURL;
		var userName = user.displayName;

		// Set the user's profile pic and name.
		this.userPic.style.backgroundImage = 'url(' + profilePicUrl + ')';
		this.userName.textContent = userName;

		// Show user's profile and sign-out button.
		this.userName.removeAttribute('hidden');
		this.userPic.removeAttribute('hidden');
		this.signOutButton.removeAttribute('hidden');

		// Hide sign-in button.
		this.signInButton.setAttribute('hidden', 'true');

		var data = {
			message: 'Signed in as ' + userName,
			timeout: 2000
		};
		this.snackbar.MaterialSnackbar.showSnackbar(data);
	} else { // User is signed out!
		// Hide user's profile and sign-out button.
		this.userName.setAttribute('hidden', 'true');
		this.userPic.setAttribute('hidden', 'true');
		this.signOutButton.setAttribute('hidden', 'true');

		// Show sign-in button.
		this.signInButton.removeAttribute('hidden');

		var data = {
			message: 'Logout successful',
			timeout: 2000
		};
		this.snackbar.MaterialSnackbar.showSnackbar(data);
	}
};

// A loading image URL.
Notes.LOADING_IMAGE_URL = 'https://www.google.com/images/spin-32.gif';

// Checks that the Firebase SDK has been correctly setup and configured.
Notes.prototype.checkSetup = function() {
	if (!window.firebase || !(firebase.app instanceof Function) || !window.config) {
		window.alert('You have not configured and imported the Firebase SDK. ' +
				'Make sure you go through the codelab setup instructions.');
	} else if (config.storageBucket === '') {
		window.alert('Your Firebase Storage bucket has not been enabled. Sorry about that. This is ' +
				'actually a Firebase bug that occurs rarely. ' +
				'Please go and re-generate the Firebase initialisation snippet (step 4 of the codelab) ' +
				'and make sure the storageBucket attribute is not empty. ' +
				'You may also need to visit the Storage tab and paste the name of your bucket which is ' +
				'displayed there.');
	}
};

window.onload = function() {
	window.notes = new Notes();
};
