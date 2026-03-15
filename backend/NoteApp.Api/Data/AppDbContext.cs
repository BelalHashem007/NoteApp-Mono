using Microsoft.EntityFrameworkCore;
using NoteApp.Api.Entities;

namespace NoteApp.Api.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
            
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            //note constraints
            modelBuilder.Entity<Note>()
                .Property(n => n.Id)
                .HasDefaultValueSql("NEWSEQUENTIALID()");

            modelBuilder.Entity<Note>()
                .Property(n => n.CreatedAt)
                .HasDefaultValueSql("GETUTCDATE()");

            modelBuilder.Entity<Note>()
                .Property(n => n.UpdatedAt)
                .HasDefaultValueSql("GETUTCDATE()");

            modelBuilder.Entity<Note>()
                .Property(n => n.Title)
                .HasMaxLength(50)
                .IsRequired();

            //folder constraints
            modelBuilder.Entity<Folder>()
                .Property(f => f.Name)
                .HasMaxLength(50)
                .IsRequired();

            modelBuilder.Entity<Folder>()
                .Property(f => f.CreatedAt)
                .HasDefaultValueSql("GETUTCDATE()");
        }

        public DbSet<Note> Notes { get; set; }
        public DbSet<Folder> Folders { get; set; }
    }
}
