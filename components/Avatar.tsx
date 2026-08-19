function initials(name: string) {
	return name
		.split(" ")
		.filter(Boolean)
		.slice(0, 2)
		.map((p) => p[0]?.toUpperCase())
		.join("");
}

type AvatarProps = {
	photoKey?: string | null;
	name: string;
	size?: number;
	className?: string;
};

export function Avatar({ photoKey, name, size = 56, className = "" }: AvatarProps) {
	const style = { height: size, width: size };
	const textSizeClass = size >= 80 ? "text-2xl" : size >= 48 ? "text-base" : "text-xs";

	if (photoKey) {
		return (
			// eslint-disable-next-line @next/next/no-img-element
			<img
				src={`/api/files/photo?key=${encodeURIComponent(photoKey)}`}
				alt={name}
				style={style}
				className={`shrink-0 rounded-full object-cover ${className}`}
			/>
		);
	}

	return (
		<span
			aria-hidden="true"
			style={style}
			className={`flex shrink-0 items-center justify-center rounded-full bg-brand-primary font-bold text-white ${textSizeClass} ${className}`}
		>
			{initials(name)}
		</span>
	);
}
