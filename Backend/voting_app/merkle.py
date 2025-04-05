import hashlib

class MerkleTree:
    def __init__(self, leaves):
        self.leaves = [self._hash(leaf) for leaf in leaves]
        self.tree = self._build_tree(self.leaves)

    def _hash(self, value):
        return hashlib.sha256(value.encode()).hexdigest()

    def _build_tree(self, leaves):
        if len(leaves) == 1:
            return leaves
        new_level = []
        for i in range(0, len(leaves), 2):
            combined = leaves[i] + (leaves[i + 1] if i + 1 < len(leaves) else leaves[i])
            new_level.append(self._hash(combined))
        return self._build_tree(new_level)

    def get_root(self):
        return self.tree[0] if self.tree else None

    def get_proof(self, index):
        proof = []
        tree_level = self.leaves
        while len(tree_level) > 1:
            sibling_index = index ^ 1  # XOR to get sibling
            proof.append(tree_level[sibling_index] if sibling_index < len(tree_level) else None)
            index //= 2
            tree_level = [self._hash(tree_level[i] + tree_level[i + 1] if i + 1 < len(tree_level) else tree_level[i])
                          for i in range(0, len(tree_level), 2)]
        return proof
