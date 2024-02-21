import { app } from "./firebase-config";
import {
	getFirestore,
	collection,
	getDocs,
	addDoc,
	query,
	orderBy,
	deleteDoc,
	doc,
	updateDoc,
	getDoc,
} from "firebase/firestore";

const db = getFirestore(app);
const bookmarksRef = collection(db, "bookmarks");
const q = query(bookmarksRef, orderBy("createAt"));
const urlList = document.querySelector(".urlList");

async function fetchDocs() {
	try {
		const querySnapshot = await getDocs(q);
		for (let i = 0; i < querySnapshot.size; i++) {
			const doc = querySnapshot.docs[i];
			const html = `
            <ul class="urlItem" data-id="${doc.id}"> 
                <li class="title">${i + 1}. ${
				doc.data().title
			} <button class="delete bg-gray-500 w-14 h-8 text-white p-0 ml-5 rounded-lg	">Delete</button><button class="edit bg-gray-500 w-14 h-8 text-white p-0 ml-5 rounded-lg">Edit</button></li>
                <li class="itemUrl">
                    <a class="url text-blue-500" href="${doc.data().url}">${
				doc.data().url
			}</a>
                </li>
                ${
									doc.data().description
										? `<li class="description">${doc.data().description}</li>`
										: ""
								}
                
            </ul>`;
			urlList.insertAdjacentHTML("beforeend", html);
		}
	} catch (error) {
		console.error("Error getting documents: ", error);
	}
}

fetchDocs();

const title = document.querySelector(".linkTitle");
const url = document.querySelector(".linkInput");
const description = document.querySelector(".linkDescription");
const form = document.querySelector("form");

form.addEventListener("submit", (e) => {
	e.preventDefault();
	addBookmark();
});

async function addBookmark() {
	const titleValue = title.value.trim();
	const urlValue = url.value.trim();
	const descriptionValue = description.value.trim();
	if (!titleValue || !urlValue) {
		alert("タイトルとURLを入力してください");
		return;
	}

	const urlPattern = /^.*\.com$/;
	if (!urlPattern.test(urlValue)) {
		alert("正しいURLを入力してください");
		return;
	}

	const newBookmark = {
		title: titleValue,
		url: urlValue,
		createAt: new Date(),
	};
	if (descriptionValue) {
		newBookmark.description = descriptionValue;
	}
	try {
		await addDoc(bookmarksRef, newBookmark);
		console.log("Document successfully written!");
		window.location.reload();
	} catch (error) {
		console.error("Error writing document: ", error);
	}
}

urlList.addEventListener("click", async (e) => {
	if (e.target.classList.contains("delete")) {
		const id = e.target.parentElement.parentElement.getAttribute("data-id");
		try {
			await deleteDoc(doc(db, "bookmarks", id));
			e.target.parentElement.parentElement.remove();
		} catch (error) {
			console.error("Error deleting document: ", error);
		}
	}
});
async function editBookmark(e) {
	if (e.target.classList.contains("edit")) {
		const id = e.target.parentElement.parentElement.getAttribute("data-id");
		const docRef = doc(db, "bookmarks", id);
		const docSnap = await getDoc(docRef);

		if (docSnap.exists()) {
			const data = docSnap.data();
			const ul = e.target.parentElement.parentElement;
			ul.innerHTML = `
                <form class="editForm flex flex-col p-5" data-id="${id}">
                    <input type="text" class="editTitle border-2 border-gray-300 p-2 mb-2"" value="${
											data.title
										}">
                    <input type="text" class="editUrl border-2 border-gray-300 p-2 mb-2"" value="${
											data.url
										}">
                    <input type="text" class="editDescription border-2 border-gray-300 p-2 mb-2"" value="${
											data.description || ""
										}">
                    <button type="submit" class="submitEdit bg-gray-500 w-14 h-8 text-white p-0 ml-5 rounded-lg">Submit</button>
                </form>
            `;
		} else {
			console.log("No such document!");
		}
	}
}

urlList.addEventListener("click", editBookmark);
urlList.addEventListener("submit", async (e) => {
	e.preventDefault();
	if (e.target.classList.contains("editForm")) {
		const id = e.target.getAttribute("data-id");
		const titleValue = e.target.querySelector(".editTitle").value.trim();
		const urlValue = e.target.querySelector(".editUrl").value.trim();
		const descriptionValue = e.target
			.querySelector(".editDescription")
			.value.trim();

		const updatedBookmark = {
			title: titleValue,
			url: urlValue,
			description: descriptionValue,
		};

		try {
			await updateDoc(doc(db, "bookmarks", id), updatedBookmark);
			console.log("Document successfully updated!");
			window.location.reload();
		} catch (error) {
			console.error("Error updating document: ", error);
		}
	}
});
