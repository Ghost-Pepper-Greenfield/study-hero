import React, { useEffect, useState } from "react";
import axios from "axios";
import { db, auth } from "../firebase-config";
import { useNavigate } from "react-router-dom";
import { query, collection, getDocs, where } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";

export default function UserLog() {
	const [logs, setLogs] = useState([]);
	const [uid, setUid] = useState("");
	const [user, loading, error] = useAuthState(auth);
	const navigate = useNavigate();

	const fetchUid = async () => {
		try {
			const q = query(collection(db, "users"), where("uid", "==", user?.uid));
			const doc = await getDocs(q);
			const data = doc.docs[0].data();
			setUid(data.uid);
		} catch (err) {
			console.error(err);
			alert("An error occured while fetching user data");
		}
	};

	const getUserLogs = async () => {
		try {
			console.log(uid);
			console.log("🌏");
			const fetchedLogs = await axios.get(`/${uid}/sessions`);
			setLogs(fetchedLogs.data);
		} catch (err) {
			console.error(err);
		}
	};

	const table = logs.map((log) => {
		//  Date: {log.date} Duration: {log.duration} Points: {log.points}
		return (
			<tr>
				<td>{log.date}</td>
				<td>{log.duration}</td>
				<td>{log.points}</td>
			</tr>
		);
	});

	useEffect(() => {
		if (loading) return;
		if (!user) return navigate("/database");
		fetchUid();
	}, [user, loading]);

	useEffect(() => {
		if (uid) getUserLogs();
	}, [uid]);

	return (
		<div className="nes-table-responsive">
			<table className="nes-table is-bordered">
				<thead>
					<tr>
						<th>Date</th>
						<th>Duration</th>
						<th>Points</th>
					</tr>
				</thead>
				<tbody>{table}</tbody>
			</table>
		</div>
	);

	// <div>{table}</div>;
}
