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
} from "firebase/firestore";

const db = getFirestore(app);
const bookmarksRef = collection(db, "bookmarks");
const q = query(bookmarksRef, orderBy("createdAt"));

const urlList = document.querySelector(".urlList");

getDocs(q)
	.then((querySnapshot) => {
		for (let i = 0; i < querySnapshot.size; i++) {
			const doc = querySnapshot.docs[i];
			const html = `
            <ul class="urlItem" data-id="${doc.id}"> 
                <li class="title">${i + 1}. ${
				doc.data().title
			} <button class="delete bg-gray-500 w-14 h-8 text-white p-0 ml-5 rounded-lg	">Delete</button></li>
                <li class="itemUrl">
                    <a class="url text-blue-500" href="${doc.data().url}">${
				doc.data().url
			}</a>
                </li>
            </ul>
        `;
			urlList.insertAdjacentHTML("beforeend", html);
		}
	})
	.catch((error) => {
		console.error("Error getting documents: ", error);
	});

const title = document.querySelector(".linkTitle");
const url = document.querySelector(".linkInput");
const submit = document.querySelector(".submit");

submit.addEventListener("click", (e) => {
	addBookmark();
});

function addBookmark() {
	const titleValue = title.value.trim();
	const urlValue = url.value.trim();

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
		createdAt: new Date(),
	};

	addDoc(bookmarksRef, newBookmark)
		.then(() => {
			console.log("Document successfully written!");
			window.location.reload();
		})
		.catch((error) => {
			console.error("Error writing document: ", error);
		});
}

urlList.addEventListener("click", async (e) => {
	if (e.target.classList.contains("delete")) {
		const id = e.target.parentElement.parentElement.getAttribute("data-id");
		await deleteDoc(doc(db, "bookmarks", id));
		e.target.parentElement.parentElement.remove();
	}
});
