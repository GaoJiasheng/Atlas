# Synthetic deep-time fixture provenance

Everything in this draft topic is TEST/DESIGN data created by Atlas for engine assertions, not a scientific reconstruction or real fossil dataset. S1 identifies this design source. The seven TopoJSON patches are intentionally simple synthetic geometry. The modern test patch does not claim to depict a country outline.

Age fixtures: A=[75,65], B=[90,80], C=[66,66], GAP=[145,140] and [100,95] Ma. Four collections contain five unique occurrences. Reference points and four cards are separate evidence objects.

Suppression fixture: a synthetic input scenario removes two MY collections containing three occurrences. The public manifest records only these aggregate counts. No MY fossil point, raw identifier, precise location, centroid or reversible coordinate is published. The MY card is region-only and has no coordinate. The suppression behavior itself is covered by unit tests with synthetic raw rows.
