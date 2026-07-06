import { z } from "zod";

const passwordStrength = z
	.string()
	.min(8, "La contraseña debe tener al menos 8 caracteres.")
	.max(72, "La contraseña no puede exceder 72 caracteres.")
	.regex(/[A-Z]/, "La contraseña debe contener al menos una mayúscula.")
	.regex(/[^a-zA-Z0-9]/, "La contraseña debe contener al menos un símbolo.");

export const registerSchema = z
	.object({
		email: z.string().email("Correo inválido.").trim().toLowerCase(),
		password: passwordStrength,
		role: z.enum(["student", "coach"]).default("student"),
		fullName: z
			.string()
			.min(2, "El nombre debe tener al menos 2 caracteres.")
			.max(120, "El nombre no puede exceder 120 caracteres.")
			.trim(),
	})
	.superRefine((data, ctx) => {
		if (data.role === "student") {
			if (!data.email.endsWith("@alumno.ipn.mx")) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "Los alumnos deben usar su correo institucional @alumno.ipn.mx.",
					path: ["email"],
				});
			} else if (!/\d{4}@alumno\.ipn\.mx$/.test(data.email)) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "El correo debe terminar con exactamente 4 dígitos antes de @alumno.ipn.mx (ej. nombre1234@alumno.ipn.mx).",
					path: ["email"],
				});
			}
		}
	});

export const loginSchema = z.object({
	email: z.string().email("Correo inválido.").trim().toLowerCase(),
	password: z
		.string()
		.min(8, "La contraseña debe tener al menos 8 caracteres.")
		.max(72, "La contraseña no puede exceder 72 caracteres."),
});

export const forgotPasswordSchema = z.object({
	email: z.string().email("Correo inválido.").trim().toLowerCase(),
});

export const resetPasswordSchema = z.object({
	token: z.string().min(1, "Token requerido."),
	password: passwordStrength,
});

const sportEnum = z.enum(["basketball", "soccer", "flag_football", "volleyball"]);

const schoolEnum = z.enum(["ESIME", "ESIQIE", "ESFM", "ESIA", "ESIT", "ENCB", "ESCOM", "UPIITA", "UPIBI"]);

const genderEnum = z.enum(["male", "female", "other"]);

export const studentProfileSchema = z.object({
	fullName: z.string().min(2, "El nombre debe tener al menos 2 caracteres.").max(120).trim(),
	birthDate: z.string().optional(),
	school: schoolEnum,
	semester: z.coerce.number().int().min(1).max(12).optional().or(z.literal("")),
	gender: genderEnum.optional(),
	favoriteSport: sportEnum.optional(),
	socialLink: z.string().url("Debe ser una URL válida.").optional().or(z.literal("")),
});

export const studentGeneralCardSchema = z.object({
	heightCm: z.coerce.number().int().min(50).max(270).optional().or(z.literal("")),
	weightKg: z.coerce.number().int().min(20).max(400).optional().or(z.literal("")),
	phone: z.string().regex(/^\d{10}$/, "El teléfono debe tener exactamente 10 dígitos.").optional().or(z.literal("")),
	publicEmail: z.string().email("Correo inválido.").optional().or(z.literal("")),
	experienceLevel: z.enum(["beginner", "intermediate", "advanced"]).optional(),
	isPublic: z.boolean().default(false),
	medicalInfo: z
		.object({
			previousInjuries: z.string().max(500).optional(),
			currentInjury: z.string().max(500).optional(),
			surgeries: z.string().max(300).optional(),
			asthma: z.boolean().optional(),
		})
		.optional(),
	documents: z
		.object({
			inscriptionProof: z.string().max(500).optional(),
			medicalInsurance: z.string().max(500).optional(),
		})
		.optional(),
});

export const studentSpecializedCardSchema = z.object({
	sport: sportEnum,
	data: z.record(z.string(), z.unknown()).default({}),
});

export const coachProfileSchema = z.object({
	displayName: z.string().min(2, "El nombre debe tener al menos 2 caracteres.").max(120).trim(),
	academicUnit: schoolEnum,
	phone: z.string().regex(/^\d{10}$/, "El teléfono debe tener exactamente 10 dígitos.").optional().or(z.literal("")),
	bio: z.string().max(1000).optional(),
	sports: z
		.array(sportEnum)
		.min(1, "Selecciona al menos un deporte."),
});

export const coachDocumentsSchema = z.object({
	documents: z
		.array(
			z.object({
				sport: sportEnum,
				documentUrl: z.string().url("Debe ser una URL válida."),
			}),
		)
		.min(1),
});

const categoryGenderEnum = z.enum(["V", "F", "Mixto"]);

export const coachCardSchema = z.object({
	certifications: z.string().max(1000).optional(),
	experience: z.string().max(1000).optional(),
	yearsExperience: z.coerce.number().int().min(0).max(60).optional().or(z.literal("")),
	categories: z.array(categoryGenderEnum).optional(),
	achievements: z.string().max(2000).optional(),
});

// ─── Event creation ───────────────────────────────────────────────────────────

export const createEventSchema = z
	.object({
		type: z.enum(["training", "tournament", "recruitment"]),
		sport: sportEnum,
		title: z.string().min(3, "Mínimo 3 caracteres.").max(120).trim(),
		visibility: z.enum(["public", "sport", "unit"]).default("public"),
		academicUnit: z.string().max(120).optional(),
		shortDescription: z.string().max(300).optional(),
		longDescription: z.string().max(3000).optional(),
		locationText: z.string().max(200).optional(),
		mapsUrl: z.string().url("URL inválida.").optional().or(z.literal("")),
		startAt: z.string().optional(),
		endAt: z.string().optional(),
		capacity: z.coerce.number().int().min(1).optional().or(z.literal("")),
		registrationDeadline: z.string().optional(),
		cost: z.string().max(100).optional(),
		notes: z.string().max(1000).optional(),
		autoClose: z.boolean().default(false),
		// Tournament-specific
		format: z.enum(["liga", "KO", "grupos"]).optional(),
		category: z.enum(["V", "F", "Mixto"]).optional(),
		minTeams: z.coerce.number().int().min(2).optional().or(z.literal("")),
		maxTeams: z.coerce.number().int().min(2).optional().or(z.literal("")),
		playersPerTeam: z.coerce.number().int().min(1).optional().or(z.literal("")),
		substitutes: z.coerce.number().int().min(0).optional().or(z.literal("")),
		rulesLink: z.string().url("URL inválida.").optional().or(z.literal("")),
		gameDays: z.array(z.string()).optional(),
		timeWindow: z.string().max(100).optional(),
		registrationRequirements: z.string().max(1000).optional(),
		// Training-specific
		scheduleDays: z.array(z.string()).optional(),
		startTime: z.string().optional(),
		endTime: z.string().optional(),
		// Recruitment-specific
		targetTeam: z.string().max(120).optional(),
		level: z.enum(["open", "beginner", "intermediate", "experienced"]).optional(),
		sportsCharacteristics: z.record(z.string(), z.unknown()).optional(),
		whatToBring: z.string().max(500).optional(),
		evaluationFormat: z.string().max(500).optional(),
	})
	.superRefine((data, ctx) => {
		if (data.type === "tournament" && !data.startAt) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "La fecha de inicio es requerida para torneos.",
				path: ["startAt"],
			});
		}
		if (data.type === "recruitment" && !data.startAt) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "La fecha de inicio es requerida para reclutamientos.",
				path: ["startAt"],
			});
		}
	});
