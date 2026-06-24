from writing_vector import extract_writing_vector
from persona_vectors import PERSONA_VECTORS
from empathy_engine import compute_empathy_distances

# Test 1 — Urban policy writer (should reach urban personas, miss rural ones)
text_1 = "Government announces new MSP scheme for wheat farmers in Punjab and Haryana"
vec_1 = extract_writing_vector(text_1)
profile_1 = {"origin": "metro", "language": "english", 
              "profession": "policy", "audience": "general"}

result_1 = compute_empathy_distances(vec_1, profile_1, PERSONA_VECTORS)

print("\n" + "="*65)
print("TEST 1 — Government MSP announcement")
print("="*65)
print(f"\n{result_1['reach_sentence']}")
print(f"{result_1['benchmark_sentence']}")
print(f"\nBenchmark: {result_1['profile_benchmark']}")
print(f"\nPersona breakdown:")
for p in result_1['personas']:
    zone_icon = {"CLOSE": "🔵", "DISTANT": "🟡", "BLIND_SPOT": "🔴"}[p['zone']]
    reached = "✓" if p['reached'] else " "
    print(f"  {zone_icon} {reached} {p['id']:35} dist={p['distance']:.3f}  {p['zone']}")

# Test 2 — Startup pitch (should reach urban/tech personas, miss rural)
text_2 = "Our startup just launched a new app for gig workers in metro cities"
vec_2 = extract_writing_vector(text_2)
profile_2 = {"origin": "metro", "language": "english",
              "profession": "business", "audience": "general"}

result_2 = compute_empathy_distances(vec_2, profile_2, PERSONA_VECTORS)

print("\n" + "="*65)
print("TEST 2 — Startup pitch")
print("="*65)
print(f"\n{result_2['reach_sentence']}")
print(f"{result_2['benchmark_sentence']}")
print(f"\nPersona breakdown:")
for p in result_2['personas']:
    zone_icon = {"CLOSE": "🔵", "DISTANT": "🟡", "BLIND_SPOT": "🔴"}[p['zone']]
    reached = "✓" if p['reached'] else " "
    print(f"  {zone_icon} {reached} {p['id']:35} dist={p['distance']:.3f}  {p['zone']}")

print("\n" + "="*65)
print("WHAT TO CHECK:")
print("="*65)
print("""
Test 1 (MSP announcement — institutional, policy language):
  ✓ farmer_kannur and farmer_anantapur should be CLOSE or DISTANT 
    (high institutional_density match)
  ✓ startup_founder_pune should be DISTANT or BLIND_SPOT 
    (low institutional match, high complexity mismatch)
  ✓ homemaker_thanjavur and homemaker_hoshiarpur should be DISTANT 
    (institutional match but complexity mismatch)
  ✓ reach_sentence number should be 2-5 (not 0, not 12)

Test 2 (Startup pitch — urban, individual, tech language):
  ✓ startup_founder_pune should be CLOSE
  ✓ corporate_employee_chennai should be CLOSE
  ✓ Both farmers should be BLIND_SPOT
  ✓ Both homemakers should be BLIND_SPOT
  ✓ reach_sentence number should be 2-4
""")