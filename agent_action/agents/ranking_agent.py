# agent_actions/agents/ranking_agent.py
from typing import List, Dict

class RankingAgent:
    def __init__(self):
        pass

    def rank_profiles(self, comparison_results: List[Dict]) -> List[Dict]:
        """
        Ranks consultant profiles based on their similarity scores in descending order.

        Args:
            comparison_results: A list of dictionaries from the ComparisonAgent,
                                each containing 'profile_name', 'similarity_score', and 'reasoning'.

        Returns:
            A list of dictionaries, sorted by 'similarity_score' in descending order.
        """
        if not comparison_results:
            return []

        # Sort the profiles by similarity_score in descending order
        ranked_profiles = sorted(comparison_results, key=lambda x: x.get('similarity_score', 0.0), reverse=True)
        return ranked_profiles
