using DreamTeamEver.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DreamTeamEver.Infrastructure.Data;

public class DreamTeamEverDbContext : DbContext
{
    public DreamTeamEverDbContext(DbContextOptions<DreamTeamEverDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();

    public DbSet<Member> Members => Set<Member>();

    public DbSet<PaymentTransaction> PaymentTransactions => Set<PaymentTransaction>();

    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(e =>
        {
            e.HasIndex(u => u.Email).IsUnique();
            e.HasOne(u => u.MemberProfile)
                .WithOne(m => m.User)
                .HasForeignKey<Member>(m => m.UserId)
                .OnDelete(DeleteBehavior.Cascade);
            e.HasMany(u => u.RefreshTokens)
                .WithOne(t => t.User)
                .HasForeignKey(t => t.UserId)
                .OnDelete(DeleteBehavior.Cascade);
            e.Property(u => u.LastLoginLocationKey).HasMaxLength(16);
        });

        modelBuilder.Entity<Member>(e =>
        {
            e.HasIndex(m => m.MatriculeCode).IsUnique().HasFilter("\"MatriculeCode\" IS NOT NULL");
        });

        modelBuilder.Entity<PaymentTransaction>(e =>
        {
            e.HasOne(p => p.Member)
                .WithMany(m => m.Payments)
                .HasForeignKey(p => p.MemberId)
                .OnDelete(DeleteBehavior.Cascade);

            e.Property(p => p.Amount).HasPrecision(18, 2);
        });

        modelBuilder.Entity<RefreshToken>(e =>
        {
            e.HasIndex(t => t.TokenHash);
        });
    }
}
