using DreamTeamEver.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DreamTeamEver.Infrastructure.Persistence;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();

    public DbSet<Student> Students => Set<Student>();

    public DbSet<PaymentTransaction> PaymentTransactions => Set<PaymentTransaction>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(e =>
        {
            e.HasIndex(u => u.Email).IsUnique();
            e.HasOne(u => u.StudentProfile)
                .WithOne(s => s.User)
                .HasForeignKey<Student>(s => s.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Student>(e =>
        {
            e.HasIndex(s => s.MatriculeCode).IsUnique().HasFilter("\"MatriculeCode\" IS NOT NULL");
        });

        modelBuilder.Entity<PaymentTransaction>(e =>
        {
            e.HasOne(p => p.Student)
                .WithMany(s => s.Payments)
                .HasForeignKey(p => p.StudentId)
                .OnDelete(DeleteBehavior.Cascade);

            e.Property(p => p.Amount).HasPrecision(18, 2);
        });
    }
}
