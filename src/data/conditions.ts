export interface Condition {
  id: string;
  name: string;
  category: string;
  synonyms: string[];
  sortOrder: number;
}

export const conditionCategories = [
  'Cardio',
  'Endocrine',
  'Neuro',
  'Respiratory',
  'GI',
  'Autoimmune',
  'Mental Health',
  'Women\'s Health',
  'Men\'s Health',
  'Renal',
  'Dermatology',
  'General/Other',
];

export const conditions: Condition[] = [
  // ===================== CARDIO =====================
  { id: 'hypertension', name: 'Hypertension', category: 'Cardio', synonyms: ['high blood pressure', 'hbp', 'elevated bp'], sortOrder: 1 },
  { id: 'high-cholesterol', name: 'High cholesterol', category: 'Cardio', synonyms: ['hyperlipidemia', 'dyslipidemia', 'elevated cholesterol'], sortOrder: 2 },
  { id: 'arrhythmia', name: 'Arrhythmia', category: 'Cardio', synonyms: ['irregular heartbeat', 'afib', 'atrial fibrillation'], sortOrder: 3 },
  { id: 'heart-failure', name: 'Heart failure', category: 'Cardio', synonyms: ['chf', 'congestive heart failure', 'weak heart'], sortOrder: 4 },
  { id: 'coronary-artery-disease', name: 'Coronary artery disease', category: 'Cardio', synonyms: ['cad', 'heart disease', 'blocked arteries'], sortOrder: 5 },
  { id: 'heart-valve-disease', name: 'Heart valve disease', category: 'Cardio', synonyms: ['valve disorder', 'mitral valve', 'aortic valve'], sortOrder: 6 },
  { id: 'peripheral-artery-disease', name: 'Peripheral artery disease', category: 'Cardio', synonyms: ['pad', 'poor circulation', 'leg arteries'], sortOrder: 7 },
  { id: 'cardiomyopathy', name: 'Cardiomyopathy', category: 'Cardio', synonyms: ['enlarged heart', 'heart muscle disease'], sortOrder: 8 },
  { id: 'dvt', name: 'Deep vein thrombosis', category: 'Cardio', synonyms: ['dvt', 'blood clot', 'leg clot'], sortOrder: 9 },
  { id: 'pulmonary-embolism', name: 'Pulmonary embolism', category: 'Cardio', synonyms: ['pe', 'lung clot', 'embolism'], sortOrder: 10 },
  { id: 'hypotension', name: 'Hypotension', category: 'Cardio', synonyms: ['low blood pressure', 'low bp'], sortOrder: 11 },
  { id: 'atherosclerosis', name: 'Atherosclerosis', category: 'Cardio', synonyms: ['hardening of arteries', 'plaque buildup'], sortOrder: 12 },
  { id: 'angina', name: 'Angina', category: 'Cardio', synonyms: ['chest pain', 'angina pectoris'], sortOrder: 13 },
  { id: 'heart-attack-history', name: 'Heart attack (history)', category: 'Cardio', synonyms: ['mi', 'myocardial infarction', 'prior heart attack'], sortOrder: 14 },
  { id: 'stroke-history', name: 'Stroke (history)', category: 'Cardio', synonyms: ['cva', 'cerebrovascular accident', 'prior stroke'], sortOrder: 15 },

  // ===================== ENDOCRINE =====================
  { id: 'type-1-diabetes', name: 'Type 1 diabetes', category: 'Endocrine', synonyms: ['t1d', 'juvenile diabetes', 'insulin dependent'], sortOrder: 1 },
  { id: 'type-2-diabetes', name: 'Type 2 diabetes', category: 'Endocrine', synonyms: ['t2d', 'adult onset diabetes', 'dm2'], sortOrder: 2 },
  { id: 'prediabetes', name: 'Prediabetes', category: 'Endocrine', synonyms: ['glucose intolerance', 'borderline diabetes'], sortOrder: 3 },
  { id: 'hypothyroidism', name: 'Hypothyroidism', category: 'Endocrine', synonyms: ['underactive thyroid', 'low thyroid', 'hashimotos'], sortOrder: 4 },
  { id: 'hyperthyroidism', name: 'Hyperthyroidism', category: 'Endocrine', synonyms: ['overactive thyroid', 'graves disease', 'high thyroid'], sortOrder: 5 },
  { id: 'pcos', name: 'PCOS', category: 'Endocrine', synonyms: ['polycystic ovary syndrome', 'polycystic ovarian'], sortOrder: 6 },
  { id: 'cushings-syndrome', name: 'Cushing\'s syndrome', category: 'Endocrine', synonyms: ['hypercortisolism', 'cortisol excess'], sortOrder: 7 },
  { id: 'addisons-disease', name: 'Addison\'s disease', category: 'Endocrine', synonyms: ['adrenal insufficiency', 'low cortisol'], sortOrder: 8 },
  { id: 'thyroid-nodules', name: 'Thyroid nodules', category: 'Endocrine', synonyms: ['thyroid lumps', 'nodular thyroid'], sortOrder: 9 },
  { id: 'goiter', name: 'Goiter', category: 'Endocrine', synonyms: ['enlarged thyroid', 'thyroid swelling'], sortOrder: 10 },
  { id: 'metabolic-syndrome', name: 'Metabolic syndrome', category: 'Endocrine', synonyms: ['syndrome x', 'insulin resistance syndrome'], sortOrder: 11 },
  { id: 'hypoglycemia', name: 'Hypoglycemia', category: 'Endocrine', synonyms: ['low blood sugar', 'low glucose'], sortOrder: 12 },
  { id: 'gestational-diabetes', name: 'Gestational diabetes', category: 'Endocrine', synonyms: ['pregnancy diabetes', 'gdm'], sortOrder: 13 },
  { id: 'diabetes-insipidus', name: 'Diabetes insipidus', category: 'Endocrine', synonyms: ['water diabetes', 'di'], sortOrder: 14 },
  { id: 'hyperparathyroidism', name: 'Hyperparathyroidism', category: 'Endocrine', synonyms: ['high pth', 'parathyroid'], sortOrder: 15 },

  // ===================== NEURO =====================
  { id: 'epilepsy', name: 'Epilepsy', category: 'Neuro', synonyms: ['seizure disorder', 'seizures', 'convulsions'], sortOrder: 1 },
  { id: 'migraine-condition', name: 'Migraine disorder', category: 'Neuro', synonyms: ['chronic migraine', 'migraines', 'headache disorder'], sortOrder: 2 },
  { id: 'multiple-sclerosis', name: 'Multiple sclerosis', category: 'Neuro', synonyms: ['ms', 'demyelinating disease'], sortOrder: 3 },
  { id: 'neuropathy', name: 'Neuropathy', category: 'Neuro', synonyms: ['peripheral neuropathy', 'nerve damage', 'nerve pain'], sortOrder: 4 },
  { id: 'adhd', name: 'ADHD', category: 'Neuro', synonyms: ['attention deficit', 'add', 'hyperactivity'], sortOrder: 5 },
  { id: 'parkinsons', name: 'Parkinson\'s disease', category: 'Neuro', synonyms: ['parkinsons', 'pd', 'tremor disorder'], sortOrder: 6 },
  { id: 'alzheimers', name: 'Alzheimer\'s disease', category: 'Neuro', synonyms: ['dementia', 'memory loss', 'cognitive decline'], sortOrder: 7 },
  { id: 'restless-legs', name: 'Restless legs syndrome', category: 'Neuro', synonyms: ['rls', 'leg restlessness', 'willis-ekbom'], sortOrder: 8 },
  { id: 'trigeminal-neuralgia', name: 'Trigeminal neuralgia', category: 'Neuro', synonyms: ['facial pain', 'tic douloureux'], sortOrder: 9 },
  { id: 'carpal-tunnel', name: 'Carpal tunnel syndrome', category: 'Neuro', synonyms: ['cts', 'wrist numbness', 'hand tingling'], sortOrder: 10 },
  { id: 'cluster-headaches', name: 'Cluster headaches', category: 'Neuro', synonyms: ['cluster headache disorder', 'severe headaches'], sortOrder: 11 },
  { id: 'tension-headaches', name: 'Chronic tension headaches', category: 'Neuro', synonyms: ['tension type', 'stress headaches'], sortOrder: 12 },
  { id: 'vertigo', name: 'Vertigo/BPPV', category: 'Neuro', synonyms: ['dizziness', 'benign positional vertigo', 'spinning'], sortOrder: 13 },
  { id: 'menieres', name: 'Meniere\'s disease', category: 'Neuro', synonyms: ['vertigo attacks', 'ear disorder', 'hearing loss'], sortOrder: 14 },
  { id: 'autism', name: 'Autism spectrum', category: 'Neuro', synonyms: ['asd', 'autism spectrum disorder', 'aspergers'], sortOrder: 15 },
  { id: 'tourettes', name: 'Tourette syndrome', category: 'Neuro', synonyms: ['tic disorder', 'tourettes', 'motor tics'], sortOrder: 16 },
  { id: 'narcolepsy', name: 'Narcolepsy', category: 'Neuro', synonyms: ['sleep attacks', 'excessive sleepiness'], sortOrder: 17 },
  { id: 'essential-tremor', name: 'Essential tremor', category: 'Neuro', synonyms: ['hand tremor', 'shaking'], sortOrder: 18 },

  // ===================== RESPIRATORY =====================
  { id: 'asthma', name: 'Asthma', category: 'Respiratory', synonyms: ['bronchial asthma', 'reactive airway'], sortOrder: 1 },
  { id: 'copd', name: 'COPD', category: 'Respiratory', synonyms: ['chronic obstructive', 'emphysema', 'chronic bronchitis'], sortOrder: 2 },
  { id: 'sleep-apnea', name: 'Sleep apnea', category: 'Respiratory', synonyms: ['osa', 'obstructive sleep apnea', 'breathing pauses'], sortOrder: 3 },
  { id: 'allergic-rhinitis', name: 'Allergic rhinitis', category: 'Respiratory', synonyms: ['hay fever', 'seasonal allergies', 'nasal allergies'], sortOrder: 4 },
  { id: 'chronic-sinusitis', name: 'Chronic sinusitis', category: 'Respiratory', synonyms: ['sinus problems', 'sinus infection'], sortOrder: 5 },
  { id: 'pulmonary-fibrosis', name: 'Pulmonary fibrosis', category: 'Respiratory', synonyms: ['lung scarring', 'ipf', 'interstitial lung'], sortOrder: 6 },
  { id: 'bronchiectasis', name: 'Bronchiectasis', category: 'Respiratory', synonyms: ['chronic lung infection', 'widened airways'], sortOrder: 7 },
  { id: 'pulmonary-hypertension', name: 'Pulmonary hypertension', category: 'Respiratory', synonyms: ['pah', 'lung pressure', 'pht'], sortOrder: 8 },
  { id: 'cystic-fibrosis', name: 'Cystic fibrosis', category: 'Respiratory', synonyms: ['cf', 'mucoviscidosis'], sortOrder: 9 },
  { id: 'sarcoidosis', name: 'Sarcoidosis', category: 'Respiratory', synonyms: ['lung granulomas', 'systemic sarcoid'], sortOrder: 10 },

  // ===================== GI =====================
  { id: 'gerd', name: 'GERD', category: 'GI', synonyms: ['acid reflux', 'heartburn', 'gastroesophageal reflux'], sortOrder: 1 },
  { id: 'ibs', name: 'IBS', category: 'GI', synonyms: ['irritable bowel', 'spastic colon', 'ibs-d', 'ibs-c'], sortOrder: 2 },
  { id: 'ibd-crohns', name: 'Crohn\'s disease', category: 'GI', synonyms: ['crohns', 'ibd', 'regional enteritis'], sortOrder: 3 },
  { id: 'ibd-uc', name: 'Ulcerative colitis', category: 'GI', synonyms: ['uc', 'ibd', 'colitis'], sortOrder: 4 },
  { id: 'celiac', name: 'Celiac disease', category: 'GI', synonyms: ['gluten intolerance', 'celiac sprue', 'gluten sensitivity'], sortOrder: 5 },
  { id: 'peptic-ulcer', name: 'Peptic ulcer disease', category: 'GI', synonyms: ['stomach ulcer', 'duodenal ulcer', 'gastric ulcer'], sortOrder: 6 },
  { id: 'gastritis', name: 'Gastritis', category: 'GI', synonyms: ['stomach inflammation', 'chronic gastritis'], sortOrder: 7 },
  { id: 'diverticulitis', name: 'Diverticulitis', category: 'GI', synonyms: ['diverticular disease', 'colon pouches'], sortOrder: 8 },
  { id: 'gallstones', name: 'Gallstones', category: 'GI', synonyms: ['cholelithiasis', 'gallbladder stones'], sortOrder: 9 },
  { id: 'fatty-liver', name: 'Fatty liver disease', category: 'GI', synonyms: ['nafld', 'nash', 'liver steatosis'], sortOrder: 10 },
  { id: 'hepatitis', name: 'Hepatitis', category: 'GI', synonyms: ['liver inflammation', 'hep b', 'hep c'], sortOrder: 11 },
  { id: 'cirrhosis', name: 'Cirrhosis', category: 'GI', synonyms: ['liver scarring', 'liver disease'], sortOrder: 12 },
  { id: 'pancreatitis', name: 'Pancreatitis', category: 'GI', synonyms: ['pancreas inflammation', 'chronic pancreatitis'], sortOrder: 13 },
  { id: 'gastroparesis', name: 'Gastroparesis', category: 'GI', synonyms: ['delayed gastric emptying', 'stomach paralysis'], sortOrder: 14 },
  { id: 'barretts-esophagus', name: 'Barrett\'s esophagus', category: 'GI', synonyms: ['barretts', 'esophageal changes'], sortOrder: 15 },
  { id: 'lactose-intolerance', name: 'Lactose intolerance', category: 'GI', synonyms: ['dairy intolerance', 'lactase deficiency'], sortOrder: 16 },
  { id: 'food-allergies', name: 'Food allergies', category: 'GI', synonyms: ['nut allergy', 'shellfish allergy', 'food sensitivity'], sortOrder: 17 },
  { id: 'constipation-chronic', name: 'Chronic constipation', category: 'GI', synonyms: ['bowel irregularity', 'slow transit'], sortOrder: 18 },

  // ===================== AUTOIMMUNE =====================
  { id: 'rheumatoid-arthritis', name: 'Rheumatoid arthritis', category: 'Autoimmune', synonyms: ['ra', 'inflammatory arthritis', 'joint inflammation'], sortOrder: 1 },
  { id: 'lupus', name: 'Lupus', category: 'Autoimmune', synonyms: ['sle', 'systemic lupus', 'lupus erythematosus'], sortOrder: 2 },
  { id: 'psoriasis', name: 'Psoriasis', category: 'Autoimmune', synonyms: ['psoriatic disease', 'skin plaques'], sortOrder: 3 },
  { id: 'psoriatic-arthritis', name: 'Psoriatic arthritis', category: 'Autoimmune', synonyms: ['psa', 'psoriasis arthritis'], sortOrder: 4 },
  { id: 'hashimotos', name: 'Hashimoto\'s thyroiditis', category: 'Autoimmune', synonyms: ['hashimotos', 'autoimmune thyroid'], sortOrder: 5 },
  { id: 'sjogrens', name: 'Sjögren\'s syndrome', category: 'Autoimmune', synonyms: ['sjogrens', 'dry eyes dry mouth', 'sicca syndrome'], sortOrder: 6 },
  { id: 'scleroderma', name: 'Scleroderma', category: 'Autoimmune', synonyms: ['systemic sclerosis', 'skin hardening'], sortOrder: 7 },
  { id: 'myasthenia-gravis', name: 'Myasthenia gravis', category: 'Autoimmune', synonyms: ['mg', 'muscle weakness'], sortOrder: 8 },
  { id: 'ankylosing-spondylitis', name: 'Ankylosing spondylitis', category: 'Autoimmune', synonyms: ['as', 'spinal arthritis', 'axial spondyloarthritis'], sortOrder: 9 },
  { id: 'graves-disease', name: 'Graves\' disease', category: 'Autoimmune', synonyms: ['graves', 'autoimmune hyperthyroidism'], sortOrder: 10 },
  { id: 'celiac-autoimmune', name: 'Celiac disease', category: 'Autoimmune', synonyms: ['autoimmune celiac', 'gluten autoimmune'], sortOrder: 11 },
  { id: 'vitiligo', name: 'Vitiligo', category: 'Autoimmune', synonyms: ['skin depigmentation', 'white patches'], sortOrder: 12 },
  { id: 'alopecia-areata', name: 'Alopecia areata', category: 'Autoimmune', synonyms: ['patchy hair loss', 'autoimmune hair loss'], sortOrder: 13 },
  { id: 'vasculitis', name: 'Vasculitis', category: 'Autoimmune', synonyms: ['blood vessel inflammation', 'systemic vasculitis'], sortOrder: 14 },
  { id: 'mixed-connective-tissue', name: 'Mixed connective tissue disease', category: 'Autoimmune', synonyms: ['mctd', 'overlap syndrome'], sortOrder: 15 },

  // ===================== MENTAL HEALTH =====================
  { id: 'anxiety-disorder', name: 'Anxiety disorder', category: 'Mental Health', synonyms: ['gad', 'generalized anxiety', 'chronic anxiety'], sortOrder: 1 },
  { id: 'depression', name: 'Depression', category: 'Mental Health', synonyms: ['major depression', 'mdd', 'clinical depression'], sortOrder: 2 },
  { id: 'bipolar', name: 'Bipolar disorder', category: 'Mental Health', synonyms: ['manic depression', 'bipolar i', 'bipolar ii'], sortOrder: 3 },
  { id: 'panic-disorder', name: 'Panic disorder', category: 'Mental Health', synonyms: ['panic attacks', 'anxiety attacks'], sortOrder: 4 },
  { id: 'ptsd', name: 'PTSD', category: 'Mental Health', synonyms: ['post traumatic stress', 'trauma disorder'], sortOrder: 5 },
  { id: 'ocd', name: 'OCD', category: 'Mental Health', synonyms: ['obsessive compulsive', 'obsessions compulsions'], sortOrder: 6 },
  { id: 'social-anxiety', name: 'Social anxiety', category: 'Mental Health', synonyms: ['social phobia', 'social anxiety disorder'], sortOrder: 7 },
  { id: 'eating-disorders', name: 'Eating disorders', category: 'Mental Health', synonyms: ['anorexia', 'bulimia', 'binge eating'], sortOrder: 8 },
  { id: 'insomnia-disorder', name: 'Insomnia disorder', category: 'Mental Health', synonyms: ['chronic insomnia', 'sleep disorder'], sortOrder: 9 },
  { id: 'substance-use', name: 'Substance use disorder', category: 'Mental Health', synonyms: ['addiction', 'dependency', 'substance abuse'], sortOrder: 10 },
  { id: 'schizophrenia', name: 'Schizophrenia', category: 'Mental Health', synonyms: ['psychosis', 'schizophrenic disorder'], sortOrder: 11 },
  { id: 'seasonal-affective', name: 'Seasonal affective disorder', category: 'Mental Health', synonyms: ['sad', 'winter depression', 'seasonal depression'], sortOrder: 12 },
  { id: 'bpd', name: 'Borderline personality disorder', category: 'Mental Health', synonyms: ['bpd', 'emotional dysregulation'], sortOrder: 13 },
  { id: 'phobias', name: 'Specific phobias', category: 'Mental Health', synonyms: ['phobia', 'fear disorder', 'agoraphobia'], sortOrder: 14 },

  // ===================== WOMEN'S HEALTH =====================
  { id: 'endometriosis', name: 'Endometriosis', category: 'Women\'s Health', synonyms: ['endo', 'endometrial tissue'], sortOrder: 1 },
  { id: 'pcos-womens', name: 'PCOS', category: 'Women\'s Health', synonyms: ['polycystic ovary', 'ovarian cysts'], sortOrder: 2 },
  { id: 'menopause', name: 'Menopause', category: 'Women\'s Health', synonyms: ['perimenopause', 'climacteric', 'change of life'], sortOrder: 3 },
  { id: 'pmdd', name: 'PMDD', category: 'Women\'s Health', synonyms: ['premenstrual dysphoric', 'severe pms'], sortOrder: 4 },
  { id: 'uterine-fibroids', name: 'Uterine fibroids', category: 'Women\'s Health', synonyms: ['fibroids', 'leiomyomas', 'uterine tumors'], sortOrder: 5 },
  { id: 'adenomyosis', name: 'Adenomyosis', category: 'Women\'s Health', synonyms: ['uterine adenomyosis', 'enlarged uterus'], sortOrder: 6 },
  { id: 'ovarian-cysts', name: 'Ovarian cysts', category: 'Women\'s Health', synonyms: ['cysts on ovaries', 'functional cysts'], sortOrder: 7 },
  { id: 'pelvic-inflammatory', name: 'Pelvic inflammatory disease', category: 'Women\'s Health', synonyms: ['pid', 'pelvic infection'], sortOrder: 8 },
  { id: 'vulvodynia', name: 'Vulvodynia', category: 'Women\'s Health', synonyms: ['vulvar pain', 'vestibulodynia'], sortOrder: 9 },
  { id: 'vaginismus', name: 'Vaginismus', category: 'Women\'s Health', synonyms: ['pelvic floor dysfunction', 'vaginal spasm'], sortOrder: 10 },
  { id: 'interstitial-cystitis', name: 'Interstitial cystitis', category: 'Women\'s Health', synonyms: ['ic', 'painful bladder', 'bladder pain syndrome'], sortOrder: 11 },
  { id: 'primary-ovarian-insufficiency', name: 'Primary ovarian insufficiency', category: 'Women\'s Health', synonyms: ['poi', 'premature menopause', 'early menopause'], sortOrder: 12 },
  { id: 'recurrent-uti', name: 'Recurrent UTIs', category: 'Women\'s Health', synonyms: ['chronic uti', 'frequent bladder infections'], sortOrder: 13 },

  // ===================== MEN'S HEALTH =====================
  { id: 'bph', name: 'BPH', category: 'Men\'s Health', synonyms: ['enlarged prostate', 'benign prostatic hyperplasia'], sortOrder: 1 },
  { id: 'low-testosterone', name: 'Low testosterone', category: 'Men\'s Health', synonyms: ['low t', 'hypogonadism', 'testosterone deficiency'], sortOrder: 2 },
  { id: 'erectile-dysfunction', name: 'Erectile dysfunction', category: 'Men\'s Health', synonyms: ['ed', 'impotence'], sortOrder: 3 },
  { id: 'prostatitis', name: 'Prostatitis', category: 'Men\'s Health', synonyms: ['prostate inflammation', 'chronic prostatitis'], sortOrder: 4 },
  { id: 'male-infertility', name: 'Male infertility', category: 'Men\'s Health', synonyms: ['low sperm count', 'azoospermia'], sortOrder: 5 },
  { id: 'peyronie', name: 'Peyronie\'s disease', category: 'Men\'s Health', synonyms: ['penile curvature', 'penile plaque'], sortOrder: 6 },

  // ===================== RENAL =====================
  { id: 'ckd', name: 'Chronic kidney disease', category: 'Renal', synonyms: ['ckd', 'renal failure', 'kidney disease'], sortOrder: 1 },
  { id: 'kidney-stones', name: 'Kidney stones', category: 'Renal', synonyms: ['renal calculi', 'nephrolithiasis', 'stones'], sortOrder: 2 },
  { id: 'glomerulonephritis', name: 'Glomerulonephritis', category: 'Renal', synonyms: ['gn', 'kidney inflammation', 'nephritis'], sortOrder: 3 },
  { id: 'polycystic-kidney', name: 'Polycystic kidney disease', category: 'Renal', synonyms: ['pkd', 'kidney cysts'], sortOrder: 4 },
  { id: 'nephrotic-syndrome', name: 'Nephrotic syndrome', category: 'Renal', synonyms: ['protein in urine', 'proteinuria'], sortOrder: 5 },
  { id: 'dialysis', name: 'On dialysis', category: 'Renal', synonyms: ['hemodialysis', 'peritoneal dialysis', 'esrd'], sortOrder: 6 },
  { id: 'kidney-transplant', name: 'Kidney transplant', category: 'Renal', synonyms: ['renal transplant', 'transplant recipient'], sortOrder: 7 },

  // ===================== DERMATOLOGY =====================
  { id: 'eczema', name: 'Eczema', category: 'Dermatology', synonyms: ['atopic dermatitis', 'dermatitis', 'itchy skin'], sortOrder: 1 },
  { id: 'acne-condition', name: 'Acne', category: 'Dermatology', synonyms: ['acne vulgaris', 'pimples', 'breakouts'], sortOrder: 2 },
  { id: 'rosacea', name: 'Rosacea', category: 'Dermatology', synonyms: ['facial redness', 'acne rosacea'], sortOrder: 3 },
  { id: 'psoriasis-skin', name: 'Psoriasis', category: 'Dermatology', synonyms: ['skin plaques', 'scaly skin'], sortOrder: 4 },
  { id: 'hives-chronic', name: 'Chronic hives', category: 'Dermatology', synonyms: ['chronic urticaria', 'recurring hives'], sortOrder: 5 },
  { id: 'hidradenitis', name: 'Hidradenitis suppurativa', category: 'Dermatology', synonyms: ['hs', 'skin boils', 'inverse acne'], sortOrder: 6 },
  { id: 'seborrheic-dermatitis', name: 'Seborrheic dermatitis', category: 'Dermatology', synonyms: ['dandruff', 'scalp dermatitis'], sortOrder: 7 },
  { id: 'contact-dermatitis', name: 'Contact dermatitis', category: 'Dermatology', synonyms: ['allergic dermatitis', 'skin allergy'], sortOrder: 8 },
  { id: 'hyperhidrosis', name: 'Hyperhidrosis', category: 'Dermatology', synonyms: ['excessive sweating', 'sweat disorder'], sortOrder: 9 },
  { id: 'melasma', name: 'Melasma', category: 'Dermatology', synonyms: ['skin discoloration', 'mask of pregnancy'], sortOrder: 10 },
  { id: 'keratosis-pilaris', name: 'Keratosis pilaris', category: 'Dermatology', synonyms: ['kp', 'chicken skin', 'bumpy skin'], sortOrder: 11 },

  // ===================== GENERAL/OTHER =====================
  { id: 'chronic-pain', name: 'Chronic pain', category: 'General/Other', synonyms: ['persistent pain', 'pain syndrome'], sortOrder: 1 },
  { id: 'fibromyalgia', name: 'Fibromyalgia', category: 'General/Other', synonyms: ['fibro', 'widespread pain', 'tender points'], sortOrder: 2 },
  { id: 'chronic-fatigue', name: 'Chronic fatigue syndrome', category: 'General/Other', synonyms: ['cfs', 'me/cfs', 'myalgic encephalomyelitis'], sortOrder: 3 },
  { id: 'long-covid', name: 'Long COVID', category: 'General/Other', synonyms: ['post covid', 'pasc', 'covid long hauler'], sortOrder: 4 },
  { id: 'lyme-disease', name: 'Lyme disease', category: 'General/Other', synonyms: ['chronic lyme', 'tick-borne'], sortOrder: 5 },
  { id: 'ehlers-danlos', name: 'Ehlers-Danlos syndrome', category: 'General/Other', synonyms: ['eds', 'hypermobility', 'connective tissue'], sortOrder: 6 },
  { id: 'osteoporosis', name: 'Osteoporosis', category: 'General/Other', synonyms: ['bone loss', 'brittle bones', 'low bone density'], sortOrder: 7 },
  { id: 'osteoarthritis', name: 'Osteoarthritis', category: 'General/Other', synonyms: ['oa', 'degenerative arthritis', 'wear and tear'], sortOrder: 8 },
  { id: 'gout', name: 'Gout', category: 'General/Other', synonyms: ['gouty arthritis', 'uric acid', 'toe pain'], sortOrder: 9 },
  { id: 'anemia', name: 'Anemia', category: 'General/Other', synonyms: ['low iron', 'low hemoglobin', 'blood disorder'], sortOrder: 10 },
  { id: 'vitamin-deficiency', name: 'Vitamin deficiency', category: 'General/Other', synonyms: ['b12 deficiency', 'vitamin d deficiency', 'nutrient deficiency'], sortOrder: 11 },
  { id: 'obesity', name: 'Obesity', category: 'General/Other', synonyms: ['overweight', 'weight management', 'bmi'], sortOrder: 12 },
  { id: 'pots', name: 'POTS', category: 'General/Other', synonyms: ['postural orthostatic tachycardia', 'dysautonomia'], sortOrder: 13 },
  { id: 'mast-cell', name: 'Mast cell activation syndrome', category: 'General/Other', synonyms: ['mcas', 'mast cell disorder'], sortOrder: 14 },
  { id: 'hiv', name: 'HIV', category: 'General/Other', synonyms: ['hiv positive', 'human immunodeficiency'], sortOrder: 15 },
  { id: 'cancer-survivor', name: 'Cancer survivor', category: 'General/Other', synonyms: ['cancer remission', 'post cancer'], sortOrder: 16 },
  { id: 'organ-transplant', name: 'Organ transplant', category: 'General/Other', synonyms: ['transplant recipient', 'post transplant'], sortOrder: 17 },
  { id: 'other-condition', name: 'Other condition', category: 'General/Other', synonyms: ['unlisted', 'other', 'not listed'], sortOrder: 99 },
];

export function getConditionsByCategory(category: string): Condition[] {
  return conditions.filter(c => c.category === category).sort((a, b) => a.sortOrder - b.sortOrder);
}

export function searchConditions(query: string): Condition[] {
  const lowerQuery = query.toLowerCase();
  return conditions.filter(c => 
    c.name.toLowerCase().includes(lowerQuery) ||
    c.category.toLowerCase().includes(lowerQuery) ||
    c.synonyms.some(s => s.toLowerCase().includes(lowerQuery))
  );
}
