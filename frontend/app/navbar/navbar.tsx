'use client'

import Image from "next/image";
import Link from "next/link";

import styles from "./navbar.module.css";
import { useEffect, useState } from "react";
import {  User } from "firebase/auth";
import { onAuthStateChangedHelper } from "../firebase/firebase";
import SignIn from "./sign-in";

export default function Navbar() {
    // Initialize user state
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChangedHelper((user) => {
      setUser(user);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [] /* No dependencies, never rerun */);

    return(
        <nav className={styles.nav}>
            <Link href="/">
                <Image width={110} height={40}
                    src="/logo.svg" alt="Logo"/>
            </Link>
            <SignIn user={user} />
        </nav>
    )
}