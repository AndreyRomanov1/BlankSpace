using System.Text;

namespace Infrastructure;

public static class MurmurHash3
{
    public static uint GetHash(string input, uint seed = 0)
    {
        var data = Encoding.UTF8.GetBytes(input);
        return GetHash(data, seed);
    }

    public static uint GetHash(byte[] data, uint seed = 0)
    {
        const uint c1 = 0xcc9e2d51;
        const uint c2 = 0x1b873593;
        const int r1 = 15;
        const int r2 = 13;
        const uint m = 5;
        const uint n = 0xe6546b64;

        var hash = seed;
        var length = data.Length;
        var remainingBytes = length & 3; // mod 4
        var blocks = length >> 2; // div 4

        unsafe
        {
            fixed (byte* ptr = data)
            {
                var blocksPtr = (uint*)ptr;
                for (var i = 0; i < blocks; i++)
                {
                    var k = blocksPtr[i];
                    k *= c1;
                    k = (k << r1) | (k >> (32 - r1));
                    k *= c2;

                    hash ^= k;
                    hash = (hash << r2) | (hash >> (32 - r2));
                    hash = hash * m + n;
                }
            }
        }

        // Обработка оставшихся байт
        if (remainingBytes > 0)
        {
            uint remaining = 0;
            for (var i = length - remainingBytes; i < length; i++) remaining |= (uint)data[i] << (8 * (i % 4));
            remaining *= c1;
            remaining = (remaining << r1) | (remaining >> (32 - r1));
            remaining *= c2;
            hash ^= remaining;
        }

        hash ^= (uint)length;
        hash ^= hash >> 16;
        hash *= 0x85ebca6b;
        hash ^= hash >> 13;
        hash *= 0xc2b2ae35;
        hash ^= hash >> 16;

        return hash;
    }
}