length = 100
depth = 3

for i in range(length ** depth):
    a = i // (length ** (depth - 1))
    b = (i // (length ** (depth - 2))) % (length ** (depth - 2))
    c = i % (length ** (depth - 2))

    print(a, b, c)
