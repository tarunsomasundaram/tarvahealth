import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { PageHeader } from "@/components/layout/PageHeader";
import { AnimatedPage } from "@/components/layout/AnimatedPage";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/animations";
import { StepIndicator } from "@/components/add/StepIndicator";
import { Search, Pill, Clock, Box, Check, ChevronRight, X, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useData } from "@/contexts/DataContext";
import { triggerHaptic } from "@/hooks/use-haptics";

const steps = ["Medication", "Strength", "Schedule", "Case", "Save"];

// US Generic medications database - comprehensive list with brand names
const medicationsDatabase = [
  // === CARDIOVASCULAR ===
  { id: "lisinopril", name: "Lisinopril", alternates: ["Prinivil", "Zestril"] },
  { id: "amlodipine", name: "Amlodipine", alternates: ["Norvasc"] },
  { id: "metoprolol", name: "Metoprolol", alternates: ["Lopressor", "Toprol XL"] },
  { id: "losartan", name: "Losartan", alternates: ["Cozaar"] },
  { id: "hydrochlorothiazide", name: "Hydrochlorothiazide", alternates: ["HCTZ", "Microzide"] },
  { id: "atorvastatin", name: "Atorvastatin", alternates: ["Lipitor"] },
  { id: "simvastatin", name: "Simvastatin", alternates: ["Zocor"] },
  { id: "rosuvastatin", name: "Rosuvastatin", alternates: ["Crestor"] },
  { id: "pravastatin", name: "Pravastatin", alternates: ["Pravachol"] },
  { id: "clopidogrel", name: "Clopidogrel", alternates: ["Plavix"] },
  { id: "warfarin", name: "Warfarin", alternates: ["Coumadin", "Jantoven"] },
  { id: "furosemide", name: "Furosemide", alternates: ["Lasix"] },
  { id: "carvedilol", name: "Carvedilol", alternates: ["Coreg"] },
  { id: "spironolactone", name: "Spironolactone", alternates: ["Aldactone"] },
  { id: "diltiazem", name: "Diltiazem", alternates: ["Cardizem", "Tiazac"] },
  { id: "verapamil", name: "Verapamil", alternates: ["Calan", "Verelan"] },
  { id: "atenolol", name: "Atenolol", alternates: ["Tenormin"] },
  { id: "propranolol", name: "Propranolol", alternates: ["Inderal"] },
  { id: "bisoprolol", name: "Bisoprolol", alternates: ["Zebeta"] },
  { id: "valsartan", name: "Valsartan", alternates: ["Diovan"] },
  { id: "irbesartan", name: "Irbesartan", alternates: ["Avapro"] },
  { id: "olmesartan", name: "Olmesartan", alternates: ["Benicar"] },
  { id: "enalapril", name: "Enalapril", alternates: ["Vasotec"] },
  { id: "ramipril", name: "Ramipril", alternates: ["Altace"] },
  { id: "benazepril", name: "Benazepril", alternates: ["Lotensin"] },
  { id: "apixaban", name: "Apixaban", alternates: ["Eliquis"] },
  { id: "rivaroxaban", name: "Rivaroxaban", alternates: ["Xarelto"] },
  { id: "dabigatran", name: "Dabigatran", alternates: ["Pradaxa"] },
  { id: "aspirin", name: "Aspirin", alternates: ["Bayer", "Ecotrin"] },
  { id: "ezetimibe", name: "Ezetimibe", alternates: ["Zetia"] },
  { id: "niacin", name: "Niacin", alternates: ["Niaspan"] },
  { id: "isosorbide-mononitrate", name: "Isosorbide Mononitrate", alternates: ["Imdur"] },
  { id: "nitroglycerin", name: "Nitroglycerin", alternates: ["Nitrostat", "Nitro-Dur"] },
  { id: "hydralazine", name: "Hydralazine", alternates: ["Apresoline"] },
  { id: "clonidine", name: "Clonidine", alternates: ["Catapres"] },
  { id: "digoxin", name: "Digoxin", alternates: ["Lanoxin"] },
  
  // === DIABETES ===
  { id: "metformin", name: "Metformin", alternates: ["Glucophage", "Fortamet", "Glumetza"] },
  { id: "glipizide", name: "Glipizide", alternates: ["Glucotrol"] },
  { id: "glyburide", name: "Glyburide", alternates: ["DiaBeta", "Micronase"] },
  { id: "glimepiride", name: "Glimepiride", alternates: ["Amaryl"] },
  { id: "sitagliptin", name: "Sitagliptin", alternates: ["Januvia"] },
  { id: "linagliptin", name: "Linagliptin", alternates: ["Tradjenta"] },
  { id: "saxagliptin", name: "Saxagliptin", alternates: ["Onglyza"] },
  { id: "empagliflozin", name: "Empagliflozin", alternates: ["Jardiance"] },
  { id: "dapagliflozin", name: "Dapagliflozin", alternates: ["Farxiga"] },
  { id: "canagliflozin", name: "Canagliflozin", alternates: ["Invokana"] },
  { id: "pioglitazone", name: "Pioglitazone", alternates: ["Actos"] },
  { id: "insulin-glargine", name: "Insulin Glargine", alternates: ["Lantus", "Basaglar", "Toujeo"] },
  { id: "insulin-lispro", name: "Insulin Lispro", alternates: ["Humalog", "Admelog"] },
  { id: "insulin-aspart", name: "Insulin Aspart", alternates: ["NovoLog", "Fiasp"] },
  { id: "insulin-detemir", name: "Insulin Detemir", alternates: ["Levemir"] },
  { id: "insulin-degludec", name: "Insulin Degludec", alternates: ["Tresiba"] },
  { id: "liraglutide", name: "Liraglutide", alternates: ["Victoza", "Saxenda"] },
  { id: "semaglutide", name: "Semaglutide", alternates: ["Ozempic", "Wegovy", "Rybelsus"] },
  { id: "dulaglutide", name: "Dulaglutide", alternates: ["Trulicity"] },
  { id: "tirzepatide", name: "Tirzepatide", alternates: ["Mounjaro", "Zepbound"] },
  
  // === MENTAL HEALTH ===
  { id: "sertraline", name: "Sertraline", alternates: ["Zoloft"] },
  { id: "escitalopram", name: "Escitalopram", alternates: ["Lexapro"] },
  { id: "fluoxetine", name: "Fluoxetine", alternates: ["Prozac", "Sarafem"] },
  { id: "citalopram", name: "Citalopram", alternates: ["Celexa"] },
  { id: "paroxetine", name: "Paroxetine", alternates: ["Paxil", "Pexeva"] },
  { id: "venlafaxine", name: "Venlafaxine", alternates: ["Effexor"] },
  { id: "duloxetine", name: "Duloxetine", alternates: ["Cymbalta"] },
  { id: "bupropion", name: "Bupropion", alternates: ["Wellbutrin", "Zyban"] },
  { id: "trazodone", name: "Trazodone", alternates: ["Desyrel", "Oleptro"] },
  { id: "mirtazapine", name: "Mirtazapine", alternates: ["Remeron"] },
  { id: "amitriptyline", name: "Amitriptyline", alternates: ["Elavil"] },
  { id: "nortriptyline", name: "Nortriptyline", alternates: ["Pamelor"] },
  { id: "alprazolam", name: "Alprazolam", alternates: ["Xanax"] },
  { id: "lorazepam", name: "Lorazepam", alternates: ["Ativan"] },
  { id: "clonazepam", name: "Clonazepam", alternates: ["Klonopin"] },
  { id: "diazepam", name: "Diazepam", alternates: ["Valium"] },
  { id: "buspirone", name: "Buspirone", alternates: ["Buspar"] },
  { id: "hydroxyzine", name: "Hydroxyzine", alternates: ["Vistaril", "Atarax"] },
  { id: "quetiapine", name: "Quetiapine", alternates: ["Seroquel"] },
  { id: "risperidone", name: "Risperidone", alternates: ["Risperdal"] },
  { id: "aripiprazole", name: "Aripiprazole", alternates: ["Abilify"] },
  { id: "olanzapine", name: "Olanzapine", alternates: ["Zyprexa"] },
  { id: "lithium", name: "Lithium", alternates: ["Lithobid", "Eskalith"] },
  { id: "atomoxetine", name: "Atomoxetine", alternates: ["Strattera"] },
  { id: "methylphenidate", name: "Methylphenidate", alternates: ["Ritalin", "Concerta"] },
  { id: "amphetamine-salts", name: "Amphetamine Salts", alternates: ["Adderall"] },
  { id: "lisdexamfetamine", name: "Lisdexamfetamine", alternates: ["Vyvanse"] },
  
  // === NEUROLOGICAL / EPILEPSY ===
  { id: "gabapentin", name: "Gabapentin", alternates: ["Neurontin", "Gralise"] },
  { id: "pregabalin", name: "Pregabalin", alternates: ["Lyrica"] },
  { id: "levetiracetam", name: "Levetiracetam", alternates: ["Keppra"] },
  { id: "lamotrigine", name: "Lamotrigine", alternates: ["Lamictal"] },
  { id: "valproic-acid", name: "Valproic Acid", alternates: ["Depakote", "Depakene"] },
  { id: "topiramate", name: "Topiramate", alternates: ["Topamax", "Qudexy"] },
  { id: "carbamazepine", name: "Carbamazepine", alternates: ["Tegretol", "Carbatrol"] },
  { id: "oxcarbazepine", name: "Oxcarbazepine", alternates: ["Trileptal"] },
  { id: "phenytoin", name: "Phenytoin", alternates: ["Dilantin"] },
  { id: "phenobarbital", name: "Phenobarbital", alternates: ["Luminal"] },
  { id: "zonisamide", name: "Zonisamide", alternates: ["Zonegran"] },
  { id: "brivaracetam", name: "Brivaracetam", alternates: ["Briviact"] },
  { id: "lacosamide", name: "Lacosamide", alternates: ["Vimpat"] },
  { id: "clobazam", name: "Clobazam", alternates: ["Onfi"] },
  { id: "sumatriptan", name: "Sumatriptan", alternates: ["Imitrex"] },
  { id: "rizatriptan", name: "Rizatriptan", alternates: ["Maxalt"] },
  { id: "ropinirole", name: "Ropinirole", alternates: ["Requip"] },
  { id: "pramipexole", name: "Pramipexole", alternates: ["Mirapex"] },
  { id: "carbidopa-levodopa", name: "Carbidopa-Levodopa", alternates: ["Sinemet"] },
  { id: "donepezil", name: "Donepezil", alternates: ["Aricept"] },
  { id: "memantine", name: "Memantine", alternates: ["Namenda"] },
  
  // === RESPIRATORY ===
  { id: "albuterol", name: "Albuterol", alternates: ["Ventolin", "ProAir", "Proventil"] },
  { id: "fluticasone", name: "Fluticasone", alternates: ["Flonase", "Flovent", "ArmonAir"] },
  { id: "budesonide", name: "Budesonide", alternates: ["Pulmicort", "Rhinocort"] },
  { id: "montelukast", name: "Montelukast", alternates: ["Singulair"] },
  { id: "tiotropium", name: "Tiotropium", alternates: ["Spiriva"] },
  { id: "ipratropium", name: "Ipratropium", alternates: ["Atrovent"] },
  { id: "fluticasone-salmeterol", name: "Fluticasone-Salmeterol", alternates: ["Advair", "AirDuo"] },
  { id: "budesonide-formoterol", name: "Budesonide-Formoterol", alternates: ["Symbicort"] },
  { id: "cetirizine", name: "Cetirizine", alternates: ["Zyrtec"] },
  { id: "loratadine", name: "Loratadine", alternates: ["Claritin"] },
  { id: "fexofenadine", name: "Fexofenadine", alternates: ["Allegra"] },
  { id: "diphenhydramine", name: "Diphenhydramine", alternates: ["Benadryl"] },
  { id: "benzonatate", name: "Benzonatate", alternates: ["Tessalon"] },
  { id: "guaifenesin", name: "Guaifenesin", alternates: ["Mucinex"] },
  
  // === GI / ACID REFLUX ===
  { id: "omeprazole", name: "Omeprazole", alternates: ["Prilosec"] },
  { id: "pantoprazole", name: "Pantoprazole", alternates: ["Protonix"] },
  { id: "esomeprazole", name: "Esomeprazole", alternates: ["Nexium"] },
  { id: "lansoprazole", name: "Lansoprazole", alternates: ["Prevacid"] },
  { id: "famotidine", name: "Famotidine", alternates: ["Pepcid"] },
  { id: "ranitidine", name: "Ranitidine", alternates: ["Zantac"] },
  { id: "ondansetron", name: "Ondansetron", alternates: ["Zofran"] },
  { id: "metoclopramide", name: "Metoclopramide", alternates: ["Reglan"] },
  { id: "promethazine", name: "Promethazine", alternates: ["Phenergan"] },
  { id: "dicyclomine", name: "Dicyclomine", alternates: ["Bentyl"] },
  { id: "hyoscyamine", name: "Hyoscyamine", alternates: ["Levsin"] },
  { id: "sucralfate", name: "Sucralfate", alternates: ["Carafate"] },
  { id: "mesalamine", name: "Mesalamine", alternates: ["Asacol", "Lialda"] },
  { id: "sulfasalazine", name: "Sulfasalazine", alternates: ["Azulfidine"] },
  { id: "lactulose", name: "Lactulose", alternates: ["Enulose", "Kristalose"] },
  { id: "polyethylene-glycol", name: "Polyethylene Glycol", alternates: ["MiraLAX"] },
  { id: "docusate", name: "Docusate", alternates: ["Colace"] },
  { id: "loperamide", name: "Loperamide", alternates: ["Imodium"] },
  
  // === PAIN / ANTI-INFLAMMATORY ===
  { id: "acetaminophen", name: "Acetaminophen", alternates: ["Tylenol"] },
  { id: "ibuprofen", name: "Ibuprofen", alternates: ["Advil", "Motrin"] },
  { id: "naproxen", name: "Naproxen", alternates: ["Aleve", "Naprosyn"] },
  { id: "meloxicam", name: "Meloxicam", alternates: ["Mobic"] },
  { id: "celecoxib", name: "Celecoxib", alternates: ["Celebrex"] },
  { id: "diclofenac", name: "Diclofenac", alternates: ["Voltaren"] },
  { id: "tramadol", name: "Tramadol", alternates: ["Ultram"] },
  { id: "hydrocodone-acetaminophen", name: "Hydrocodone-Acetaminophen", alternates: ["Vicodin", "Norco"] },
  { id: "oxycodone", name: "Oxycodone", alternates: ["OxyContin", "Roxicodone"] },
  { id: "morphine", name: "Morphine", alternates: ["MS Contin", "Kadian"] },
  { id: "fentanyl", name: "Fentanyl", alternates: ["Duragesic"] },
  { id: "cyclobenzaprine", name: "Cyclobenzaprine", alternates: ["Flexeril"] },
  { id: "methocarbamol", name: "Methocarbamol", alternates: ["Robaxin"] },
  { id: "baclofen", name: "Baclofen", alternates: ["Lioresal"] },
  { id: "tizanidine", name: "Tizanidine", alternates: ["Zanaflex"] },
  { id: "lidocaine", name: "Lidocaine Patch", alternates: ["Lidoderm"] },
  { id: "capsaicin", name: "Capsaicin", alternates: ["Zostrix", "Qutenza"] },
  
  // === THYROID ===
  { id: "levothyroxine", name: "Levothyroxine", alternates: ["Synthroid", "Levoxyl", "Tirosint"] },
  { id: "liothyronine", name: "Liothyronine", alternates: ["Cytomel"] },
  { id: "methimazole", name: "Methimazole", alternates: ["Tapazole"] },
  { id: "propylthiouracil", name: "Propylthiouracil", alternates: ["PTU"] },
  
  // === STEROIDS / IMMUNOSUPPRESSANTS ===
  { id: "prednisone", name: "Prednisone", alternates: ["Deltasone", "Rayos"] },
  { id: "prednisolone", name: "Prednisolone", alternates: ["Prelone", "Orapred"] },
  { id: "methylprednisolone", name: "Methylprednisolone", alternates: ["Medrol"] },
  { id: "dexamethasone", name: "Dexamethasone", alternates: ["Decadron"] },
  { id: "hydrocortisone", name: "Hydrocortisone", alternates: ["Cortef"] },
  { id: "methotrexate", name: "Methotrexate", alternates: ["Trexall", "Rheumatrex"] },
  { id: "azathioprine", name: "Azathioprine", alternates: ["Imuran"] },
  { id: "mycophenolate", name: "Mycophenolate", alternates: ["CellCept"] },
  { id: "tacrolimus", name: "Tacrolimus", alternates: ["Prograf"] },
  { id: "cyclosporine", name: "Cyclosporine", alternates: ["Neoral", "Sandimmune"] },
  { id: "hydroxychloroquine", name: "Hydroxychloroquine", alternates: ["Plaquenil"] },
  { id: "colchicine", name: "Colchicine", alternates: ["Colcrys"] },
  { id: "allopurinol", name: "Allopurinol", alternates: ["Zyloprim"] },
  { id: "febuxostat", name: "Febuxostat", alternates: ["Uloric"] },
  
  // === ANTIBIOTICS ===
  { id: "amoxicillin", name: "Amoxicillin", alternates: ["Amoxil"] },
  { id: "amoxicillin-clavulanate", name: "Amoxicillin-Clavulanate", alternates: ["Augmentin"] },
  { id: "azithromycin", name: "Azithromycin", alternates: ["Zithromax", "Z-Pack"] },
  { id: "ciprofloxacin", name: "Ciprofloxacin", alternates: ["Cipro"] },
  { id: "levofloxacin", name: "Levofloxacin", alternates: ["Levaquin"] },
  { id: "doxycycline", name: "Doxycycline", alternates: ["Vibramycin", "Doryx"] },
  { id: "cephalexin", name: "Cephalexin", alternates: ["Keflex"] },
  { id: "clindamycin", name: "Clindamycin", alternates: ["Cleocin"] },
  { id: "metronidazole", name: "Metronidazole", alternates: ["Flagyl"] },
  { id: "sulfamethoxazole-trimethoprim", name: "Sulfamethoxazole-Trimethoprim", alternates: ["Bactrim", "Septra"] },
  { id: "nitrofurantoin", name: "Nitrofurantoin", alternates: ["Macrobid", "Macrodantin"] },
  { id: "penicillin-vk", name: "Penicillin VK", alternates: ["Pen VK", "Veetids"] },
  
  // === HIV / ANTIVIRALS ===
  { id: "tenofovir-emtricitabine", name: "Tenofovir-Emtricitabine", alternates: ["Truvada", "Descovy"] },
  { id: "bictegravir-combo", name: "Bictegravir Combo", alternates: ["Biktarvy"] },
  { id: "dolutegravir", name: "Dolutegravir", alternates: ["Tivicay"] },
  { id: "efavirenz-combo", name: "Efavirenz Combo", alternates: ["Atripla"] },
  { id: "acyclovir", name: "Acyclovir", alternates: ["Zovirax"] },
  { id: "valacyclovir", name: "Valacyclovir", alternates: ["Valtrex"] },
  { id: "oseltamivir", name: "Oseltamivir", alternates: ["Tamiflu"] },
  
  // === SLEEP / INSOMNIA ===
  { id: "zolpidem", name: "Zolpidem", alternates: ["Ambien"] },
  { id: "eszopiclone", name: "Eszopiclone", alternates: ["Lunesta"] },
  { id: "zaleplon", name: "Zaleplon", alternates: ["Sonata"] },
  { id: "melatonin", name: "Melatonin", alternates: [] },
  { id: "ramelteon", name: "Ramelteon", alternates: ["Rozerem"] },
  { id: "suvorexant", name: "Suvorexant", alternates: ["Belsomra"] },
  { id: "lemborexant", name: "Lemborexant", alternates: ["Dayvigo"] },
  
  // === OSTEOPOROSIS / BONE HEALTH ===
  { id: "alendronate", name: "Alendronate", alternates: ["Fosamax"] },
  { id: "risedronate", name: "Risedronate", alternates: ["Actonel"] },
  { id: "ibandronate", name: "Ibandronate", alternates: ["Boniva"] },
  { id: "calcium-vitamin-d", name: "Calcium + Vitamin D", alternates: ["Caltrate", "Os-Cal"] },
  { id: "vitamin-d3", name: "Vitamin D3", alternates: ["Cholecalciferol"] },
  { id: "raloxifene", name: "Raloxifene", alternates: ["Evista"] },
  { id: "denosumab", name: "Denosumab", alternates: ["Prolia", "Xgeva"] },
  
  // === UROLOGICAL ===
  { id: "tamsulosin", name: "Tamsulosin", alternates: ["Flomax"] },
  { id: "finasteride", name: "Finasteride", alternates: ["Proscar", "Propecia"] },
  { id: "dutasteride", name: "Dutasteride", alternates: ["Avodart"] },
  { id: "sildenafil", name: "Sildenafil", alternates: ["Viagra", "Revatio"] },
  { id: "tadalafil", name: "Tadalafil", alternates: ["Cialis"] },
  { id: "oxybutynin", name: "Oxybutynin", alternates: ["Ditropan"] },
  { id: "solifenacin", name: "Solifenacin", alternates: ["Vesicare"] },
  { id: "mirabegron", name: "Mirabegron", alternates: ["Myrbetriq"] },
  { id: "phenazopyridine", name: "Phenazopyridine", alternates: ["Pyridium", "Azo"] },
  
  // === WOMEN'S HEALTH ===
  { id: "estradiol", name: "Estradiol", alternates: ["Estrace", "Vivelle"] },
  { id: "conjugated-estrogens", name: "Conjugated Estrogens", alternates: ["Premarin"] },
  { id: "progesterone", name: "Progesterone", alternates: ["Prometrium"] },
  { id: "medroxyprogesterone", name: "Medroxyprogesterone", alternates: ["Provera", "Depo-Provera"] },
  { id: "norethindrone", name: "Norethindrone", alternates: ["Aygestin"] },
  { id: "letrozole", name: "Letrozole", alternates: ["Femara"] },
  { id: "anastrozole", name: "Anastrozole", alternates: ["Arimidex"] },
  { id: "tamoxifen", name: "Tamoxifen", alternates: ["Nolvadex"] },
  
  // === VITAMINS & SUPPLEMENTS ===
  { id: "vitamin-b12", name: "Vitamin B12", alternates: ["Cyanocobalamin"] },
  { id: "folic-acid", name: "Folic Acid", alternates: ["Folate"] },
  { id: "iron", name: "Iron", alternates: ["Ferrous Sulfate", "Slow Fe"] },
  { id: "potassium", name: "Potassium", alternates: ["K-Dur", "Klor-Con"] },
  { id: "magnesium", name: "Magnesium", alternates: ["Mag-Ox", "Slow-Mag"] },
  { id: "zinc", name: "Zinc", alternates: ["Zinc Sulfate"] },
  { id: "omega-3", name: "Omega-3 Fatty Acids", alternates: ["Fish Oil", "Lovaza"] },
  { id: "coenzyme-q10", name: "Coenzyme Q10", alternates: ["CoQ10", "Ubiquinol"] },
  
  // === MISCELLANEOUS ===
  { id: "potassium-chloride", name: "Potassium Chloride", alternates: ["K-Dur", "Klor-Con"] },
  { id: "sodium-chloride", name: "Sodium Chloride", alternates: ["Saline"] },
  { id: "naltrexone", name: "Naltrexone", alternates: ["ReVia", "Vivitrol"] },
  { id: "acamprosate", name: "Acamprosate", alternates: ["Campral"] },
  { id: "disulfiram", name: "Disulfiram", alternates: ["Antabuse"] },
  { id: "varenicline", name: "Varenicline", alternates: ["Chantix"] },
  { id: "nicotine", name: "Nicotine", alternates: ["Nicorette", "Nicoderm"] },
  { id: "modafinil", name: "Modafinil", alternates: ["Provigil"] },
  { id: "armodafinil", name: "Armodafinil", alternates: ["Nuvigil"] },
];

const stepVariants = {
  initial: { opacity: 0, x: 20 },
  in: { opacity: 1, x: 0 },
  out: { opacity: 0, x: -20 },
};

const stepTransition = {
  type: "spring" as const,
  stiffness: 400,
  damping: 30,
};

export default function AddMedication() {
  const navigate = useNavigate();
  const location = useLocation();
  const { addMedication } = useData();
  
  // Check if coming from onboarding
  const isFromOnboarding = location.state?.fromOnboarding === true;
  
  const [currentStep, setCurrentStep] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMed, setSelectedMed] = useState<typeof medicationsDatabase[0] | null>(null);
  const [customMedName, setCustomMedName] = useState("");
  const [isCustomMed, setIsCustomMed] = useState(false);
  const [strength, setStrength] = useState("");
  const [strengthUnit, setStrengthUnit] = useState("mg");
  const [form, setForm] = useState<"tablet" | "capsule" | "liquid" | "injection" | "patch" | "other">("tablet");
  const [instructions, setInstructions] = useState("");
  const [frequency, setFrequency] = useState<"daily" | "weekly" | "custom" | "as-needed">("daily");
  const [times, setTimes] = useState(["08:00"]);
  const [reminderWindow, setReminderWindow] = useState("30");
  const [storeInCase, setStoreInCase] = useState(true);
  const [compartment, setCompartment] = useState("1");
  const [refillQuantity, setRefillQuantity] = useState("30");

  // Handler for selecting a custom medication
  const handleCustomMedication = () => {
    setIsCustomMed(true);
    setCustomMedName(searchQuery);
    setSelectedMed(null);
    nextStep();
  };

  // Get medication name for display
  const getMedicationName = () => {
    if (isCustomMed) return customMedName;
    return selectedMed?.name || "";
  };

  // Only show medications when user types a search query
  const filteredMeds = searchQuery.length > 0 
    ? medicationsDatabase.filter(
        (med) =>
          med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          med.alternates.some((alt) => alt.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : [];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSave = async () => {
    if (!selectedMed && !isCustomMed) return;
    if (isCustomMed && !customMedName.trim()) return;
    
    triggerHaptic('success');
    
    // Parse strength value
    const strengthVal = parseFloat(strength) || null;
    
    // Add the medication to cloud
    const { error } = await addMedication(
      {
        generic_name: isCustomMed ? customMedName.trim() : selectedMed!.name,
        alt_names: isCustomMed ? [] : selectedMed!.alternates,
        strength_value: strengthVal,
        strength_unit: strengthUnit || null,
        form: form,
        instructions: instructions || null,
        notes: null,
        is_active: true,
        stored_in_case: storeInCase,
        compartment: storeInCase ? parseInt(compartment) : null,
        refill_quantity_doses: parseInt(refillQuantity) || 30,
        refill_threshold_doses: 2,
      },
      {
        frequency_type: frequency,
        times_of_day: times,
        on_time_window_minutes: parseInt(reminderWindow) || 30,
        start_date: new Date().toISOString().split('T')[0],
        days_of_week: null,
        end_date: null,
      }
    );
    
    if (error) {
      console.error("Failed to add medication:", error);
      return;
    }
    
    // Navigate back to onboarding or home
    if (isFromOnboarding) {
      navigate("/onboarding/patient/medication", { state: { fromAdd: true } });
    } else {
      navigate("/");
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <motion.div
            key="step-0"
            initial="initial"
            animate="in"
            exit="out"
            variants={stepVariants}
            transition={stepTransition}
            className="section-gap"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search medications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-tarva pl-12"
              />
            </div>
            {searchQuery.length === 0 ? (
              <FadeIn>
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent mb-4">
                    <Search className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">Start typing to search medications</p>
                  <p className="text-sm text-muted-foreground/70 mt-1">Search from our database of US generics</p>
                </div>
              </FadeIn>
            ) : filteredMeds.length === 0 ? (
              <FadeIn>
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <p className="text-muted-foreground mb-4">No medications found for "{searchQuery}"</p>
                  <motion.button
                    onClick={handleCustomMedication}
                    className="flex items-center gap-3 rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 px-6 py-4"
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-primary">
                      <Plus className="h-5 w-5 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-primary">Add "{searchQuery}"</p>
                      <p className="text-xs text-muted-foreground">Add as custom medication</p>
                    </div>
                  </motion.button>
                </div>
              </FadeIn>
            ) : (
              <div className="space-y-2">
                <StaggerContainer className="space-y-2">
                  {filteredMeds.slice(0, 10).map((med) => (
                    <StaggerItem key={med.id}>
                      <motion.button
                        onClick={() => {
                          setIsCustomMed(false);
                          setSelectedMed(med);
                          nextStep();
                        }}
                        className={cn(
                          "card-tarva-interactive w-full text-left",
                          selectedMed?.id === med.id && "ring-2 ring-primary"
                        )}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent">
                            <Pill className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-foreground">{med.name}</h4>
                            <p className="text-caption">{med.alternates.join(", ")}</p>
                          </div>
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        </div>
                      </motion.button>
                    </StaggerItem>
                  ))}
                </StaggerContainer>
                
                {/* Custom medication option at the bottom */}
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  onClick={handleCustomMedication}
                  className="w-full flex items-center gap-3 rounded-xl border border-dashed border-muted-foreground/30 bg-muted/30 p-3 mt-4"
                  whileTap={{ scale: 0.98 }}
                >
                  <Plus className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Don't see your medication? Add "{searchQuery}" manually
                  </span>
                </motion.button>
              </div>
            )}
          </motion.div>
        );

      case 1:
        return (
          <motion.div
            key="step-1"
            initial="initial"
            animate="in"
            exit="out"
            variants={stepVariants}
            transition={stepTransition}
            className="section-gap"
          >
            <div className="card-tarva">
              <h3 className="text-section text-foreground mb-4">Strength & Form</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Strength</label>
                  <input
                    type="text"
                    placeholder="e.g., 10mg"
                    value={strength}
                    onChange={(e) => setStrength(e.target.value)}
                    className="input-tarva mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Form</label>
                  <div className="mt-2 flex gap-2">
                    {(["tablet", "capsule", "liquid"] as const).map((f) => (
                      <motion.button
                        key={f}
                        onClick={() => setForm(f)}
                        className={cn(
                          "rounded-xl px-4 py-2 text-sm font-medium transition-all capitalize",
                          form === f
                            ? "bg-gradient-primary text-primary-foreground"
                            : "bg-secondary text-secondary-foreground"
                        )}
                        whileTap={{ scale: 0.95 }}
                      >
                        {f}
                      </motion.button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Instructions (optional)</label>
                  <input
                    type="text"
                    placeholder="e.g., Take with food"
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    className="input-tarva mt-1"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            key="step-2"
            initial="initial"
            animate="in"
            exit="out"
            variants={stepVariants}
            transition={stepTransition}
            className="section-gap"
          >
            <div className="card-tarva">
              <h3 className="text-section text-foreground mb-4">Schedule</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Frequency</label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(["daily", "weekly", "as-needed"] as const).map((f) => (
                      <motion.button
                        key={f}
                        onClick={() => setFrequency(f)}
                        className={cn(
                          "rounded-xl px-4 py-2 text-sm font-medium transition-all capitalize",
                          frequency === f
                            ? "bg-gradient-primary text-primary-foreground"
                            : "bg-secondary text-secondary-foreground"
                        )}
                        whileTap={{ scale: 0.95 }}
                      >
                        {f === 'as-needed' ? 'As-needed' : f}
                      </motion.button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Time(s)</label>
                  <div className="mt-2 space-y-2">
                    <AnimatePresence mode="popLayout">
                      {times.map((time, index) => (
                        <motion.div 
                          key={index} 
                          className="flex items-center gap-2"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        >
                          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent">
                            <Clock className="h-5 w-5 text-primary" />
                          </div>
                          <input
                            type="time"
                            value={time}
                            onChange={(e) => {
                              const newTimes = [...times];
                              newTimes[index] = e.target.value;
                              setTimes(newTimes);
                            }}
                            className="input-tarva flex-1"
                          />
                          {times.length > 1 && (
                            <motion.button
                              onClick={() => setTimes(times.filter((_, i) => i !== index))}
                              className="btn-ghost p-2"
                              whileTap={{ scale: 0.9 }}
                            >
                              <X className="h-4 w-4" />
                            </motion.button>
                          )}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    <motion.button
                      onClick={() => setTimes([...times, "12:00"])}
                      className="btn-secondary w-full"
                      whileTap={{ scale: 0.98 }}
                    >
                      Add Another Time
                    </motion.button>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">On-time Window</label>
                  <div className="mt-2 flex gap-2">
                    {["10", "30", "60"].map((w) => (
                      <motion.button
                        key={w}
                        onClick={() => setReminderWindow(w)}
                        className={cn(
                          "flex-1 rounded-xl px-4 py-2 text-sm font-medium transition-all",
                          reminderWindow === w
                            ? "bg-gradient-primary text-primary-foreground"
                            : "bg-secondary text-secondary-foreground"
                        )}
                        whileTap={{ scale: 0.95 }}
                      >
                        {w} min
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            key="step-3"
            initial="initial"
            animate="in"
            exit="out"
            variants={stepVariants}
            transition={stepTransition}
            className="section-gap"
          >
            <div className="card-tarva">
              <h3 className="text-section text-foreground mb-4">Case Linking</h3>
              <div className="space-y-4">
                <motion.button
                  onClick={() => setStoreInCase(!storeInCase)}
                  className="flex w-full items-center justify-between rounded-xl bg-secondary p-4"
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center gap-3">
                    <Box className="h-5 w-5 text-primary" />
                    <span className="font-medium text-foreground">Store in case?</span>
                  </div>
                  <motion.div
                    className={cn(
                      "h-6 w-11 rounded-full transition-colors",
                      storeInCase ? "bg-gradient-primary" : "bg-muted"
                    )}
                    layout
                  >
                    <motion.div
                      className="h-5 w-5 translate-y-0.5 rounded-full bg-white shadow-md"
                      animate={{ x: storeInCase ? 20 : 2 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  </motion.div>
                </motion.button>

                <AnimatePresence>
                  {storeInCase && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      className="space-y-4 overflow-hidden"
                    >
                      <div>
                        <label className="text-sm font-medium text-foreground">Compartment</label>
                        <div className="mt-2 flex gap-2">
                          {["1", "2", "3", "4"].map((c) => (
                            <motion.button
                              key={c}
                              onClick={() => setCompartment(c)}
                              className={cn(
                                "flex-1 rounded-xl px-4 py-3 text-sm font-medium transition-all",
                                compartment === c
                                  ? "bg-gradient-primary text-primary-foreground"
                                  : "bg-secondary text-secondary-foreground"
                              )}
                              whileTap={{ scale: 0.95 }}
                            >
                              Slot {c}
                            </motion.button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground">Refill Quantity</label>
                        <input
                          type="number"
                          value={refillQuantity}
                          onChange={(e) => setRefillQuantity(e.target.value)}
                          className="input-tarva mt-1"
                          placeholder="Number of doses per refill"
                        />
                        <p className="mt-1 text-small">Alert when 2 doses remaining</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
            <p className="text-caption text-center">
              Add caregiver access later in Profile → Caregivers
            </p>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            key="step-4"
            initial="initial"
            animate="in"
            exit="out"
            variants={stepVariants}
            transition={stepTransition}
            className="section-gap"
          >
            <div className="card-tarva">
              <h3 className="text-section text-foreground mb-4">Summary</h3>
              <div className="space-y-3">
                <motion.div 
                  className="flex items-center gap-4 rounded-xl bg-accent p-4"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary">
                    <Pill className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">{getMedicationName()}</h4>
                    <p className="text-caption">{strength}{strengthUnit} • {form}</p>
                    {isCustomMed && (
                      <span className="text-xs text-primary">Custom medication</span>
                    )}
                  </div>
                </motion.div>
                <StaggerContainer className="grid grid-cols-2 gap-3">
                  <StaggerItem>
                    <div className="rounded-xl bg-secondary p-3">
                      <p className="text-caption">Frequency</p>
                      <p className="font-medium text-foreground">{frequency}</p>
                    </div>
                  </StaggerItem>
                  <StaggerItem>
                    <div className="rounded-xl bg-secondary p-3">
                      <p className="text-caption">Time(s)</p>
                      <p className="font-medium text-foreground">{times.join(", ")}</p>
                    </div>
                  </StaggerItem>
                  {storeInCase && (
                    <>
                      <StaggerItem>
                        <div className="rounded-xl bg-secondary p-3">
                          <p className="text-caption">Compartment</p>
                          <p className="font-medium text-foreground">Slot {compartment}</p>
                        </div>
                      </StaggerItem>
                      <StaggerItem>
                        <div className="rounded-xl bg-secondary p-3">
                          <p className="text-caption">Refill Qty</p>
                          <p className="font-medium text-foreground">{refillQuantity} doses</p>
                        </div>
                      </StaggerItem>
                    </>
                  )}
                </StaggerContainer>
                {instructions && (
                  <FadeIn delay={0.3}>
                    <div className="rounded-xl bg-secondary p-3">
                      <p className="text-caption">Instructions</p>
                      <p className="font-medium text-foreground">{instructions}</p>
                    </div>
                  </FadeIn>
                )}
              </div>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <AnimatedPage>
      <div className="page-padding">
        <PageHeader title="Add Medication" />

        <FadeIn delay={0.1}>
          <div className="mb-6">
            <StepIndicator steps={steps} currentStep={currentStep} />
          </div>
        </FadeIn>

        <AnimatePresence mode="wait">
          {renderStep()}
        </AnimatePresence>

        <motion.div 
          className="fixed bottom-24 left-0 right-0 flex gap-3 bg-background/95 px-5 py-4 backdrop-blur-sm"
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 30, delay: 0.2 }}
        >
          {currentStep > 0 ? (
            <motion.button 
              onClick={prevStep} 
              className="btn-secondary flex-1"
              whileTap={{ scale: 0.97 }}
            >
              Back
            </motion.button>
          ) : (
            <motion.button 
              onClick={() => navigate(-1)} 
              className="btn-secondary flex-1"
              whileTap={{ scale: 0.97 }}
            >
              Back
            </motion.button>
          )}
          {currentStep < steps.length - 1 ? (
            <motion.button
              onClick={nextStep}
              disabled={currentStep === 0 && !selectedMed}
              className={cn("btn-primary flex-1", currentStep === 0 && !selectedMed && "opacity-50")}
              whileTap={{ scale: 0.97 }}
            >
              Continue
            </motion.button>
          ) : (
            <motion.button 
              onClick={handleSave} 
              className="btn-primary flex-1"
              whileTap={{ scale: 0.97 }}
            >
              <Check className="h-4 w-4" />
              Save Medication
            </motion.button>
          )}
        </motion.div>
      </div>
    </AnimatedPage>
  );
}
