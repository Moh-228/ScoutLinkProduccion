"use client";

import { useState } from "react";

import { buttonClassNames } from "@/components/Button";
import { Icon } from "@/components/Icon";

type ContactRevealButtonProps = {
	userId: string;
	className?: string;
};

/** Reveals a user's contact email on demand, respecting their privacy setting. */
export function ContactRevealButton({ userId, className = "" }: ContactRevealButtonProps) {
	const [state, setState] = useState<"idle" | "loading" | "revealed" | "denied">("idle");
	const [email, setEmail] = useState<string | null>(null);
	const [message, setMessage] = useState<string | null>(null);

	async function handleContact() {
		setState("loading");
		try {
			const res = await fetch(`/api/users/${userId}/contact`);
			const json = (await res.json()) as { ok: boolean; message?: string; data?: { email: string } };
			if (!json.ok) {
				setMessage(json.message ?? "No se pudo obtener el correo de contacto.");
				setState("denied");
				return;
			}
			setEmail(json.data?.email ?? null);
			setState("revealed");
		} catch {
			setMessage("Error de red.");
			setState("denied");
		}
	}

	if (state === "revealed" && email) {
		return (
			<a
				href={`mailto:${email}`}
				className={buttonClassNames("secondary", `gap-2 ${className}`)}
			>
				<Icon name="login" size={16} />
				{email}
			</a>
		);
	}

	if (state === "denied") {
		return <p className="text-sm text-brand-primary/50">{message}</p>;
	}

	return (
		<button
			type="button"
			onClick={handleContact}
			disabled={state === "loading"}
			className={buttonClassNames("secondary", `gap-2 ${className}`)}
		>
			<Icon name="login" size={16} />
			{state === "loading" ? "Cargando..." : "Contactar"}
		</button>
	);
}
